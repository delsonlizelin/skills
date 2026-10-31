"""Observe one local Copilot transcript and send requested Bark alerts."""

import argparse
import importlib.util
import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class _Snapshot:
    """Retain lifecycle metadata without conversation text or tool arguments."""

    def __init__(self) -> None:
        self.latest_at = ""
        self.control = ""
        self.pending: dict[str, str] = {}
        self.permissions: set[str] = set()
        self.terminal = ""
        self.turn_id = ""

    def accept(self, event: dict[str, Any]) -> None:
        """Consume a complete saved event."""
        kind = event.get("type", "")
        data = event.get("data") or {}
        self.latest_at = event.get("timestamp") or self.latest_at
        if kind in {"user.message", "assistant.turn_start", "assistant.message"}:
            self.control = kind
            self.terminal = ""
            if kind == "user.message":
                self.pending.clear()
                self.permissions.clear()
            self.turn_id = data.get("turnId") or self.turn_id
        elif kind == "tool.execution_start":
            self.pending[str(data.get("toolCallId"))] = data.get("toolName", "")
            self.terminal = ""
        elif kind == "tool.execution_complete":
            self.pending.pop(str(data.get("toolCallId")), None)
        elif kind == "permission.requested":
            request_id = data.get("requestId")
            if request_id:
                self.permissions.add(str(request_id))
                self.terminal = ""
        elif kind == "permission.completed":
            self.permissions.discard(str(data.get("requestId")))
        elif kind == "assistant.turn_end":
            self.control = kind
            self.turn_id = data.get("turnId") or self.turn_id
        elif kind in {
            "session.error",
            "session.abort",
            "session.shutdown",
            "session.idle",
        }:
            self.terminal = kind

    def classify(self, now: float, stop_grace: int, stale: int) -> str:
        """Distinguish a question, a stopped turn, and stale saved activity."""
        if self.terminal:
            return "error" if self.terminal == "session.error" else "ended"
        if self.waiting_for() is not None:
            return "waiting"
        if not self.latest_at:
            return "unavailable"
        try:
            latest = datetime.fromisoformat(self.latest_at.replace("Z", "+00:00"))
            if latest.tzinfo is None:
                return "unavailable"
            age = now - latest.timestamp()
        except (TypeError, ValueError):
            return "unavailable"
        if (
            self.control == "assistant.turn_end"
            and not self.pending
            and age >= stop_grace
        ):
            return "stopped"
        return "stale" if age >= stale else "running"

    def waiting_for(self) -> str | None:
        """Describe the blocking control without retaining its private payload."""
        if self.permissions:
            return "permission"
        if "ask_user" in self.pending.values():
            return "user_answer"
        if "exit_plan_mode" in self.pending.values():
            return "plan_review"
        return None

    def alert_key(self, status: str) -> str:
        """Allow a fresh question or stopped turn to alert even between polls."""
        if status == "waiting":
            requests = sorted(
                [f"permission:{key}" for key in self.permissions]
                + [
                    key
                    for key, value in self.pending.items()
                    if value in {"ask_user", "exit_plan_mode"}
                ]
            )
            return status + ":" + ",".join(requests)
        if status == "stopped":
            return status + ":" + self.turn_id
        return status


class _Reader:
    """Tail complete records and rebuild state when a transcript is replaced."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.offset = 0
        self.identity: tuple[int, int] | None = None
        self.snapshot = _Snapshot()

    def refresh(self) -> _Snapshot:
        """Leave a partial final line for the next poll."""
        stat = self.path.stat()
        identity = (stat.st_dev, stat.st_ino)
        if identity != self.identity or stat.st_size < self.offset:
            self.snapshot = _Snapshot()
            self.offset = 0
            self.identity = identity
        with self.path.open("rb") as stream:
            stream.seek(self.offset)
            while line := stream.readline():
                if not line.endswith(b"\n"):
                    break
                self.offset = stream.tell()
                try:
                    event = json.loads(line)
                except (UnicodeDecodeError, json.JSONDecodeError):
                    continue
                if isinstance(event, dict):
                    self.snapshot.accept(event)
        return self.snapshot


def _send(args: argparse.Namespace, status: str, snapshot: _Snapshot) -> dict[str, Any]:
    """Call the maintained Bark helper without logging credential-bearing errors."""
    bodies = {
        "waiting": f"{args.label} is waiting for your answer or approval.",
        "stopped": f"{args.label}'s turn ended; check its result or next step.",
        "stale": f"{args.label} has no saved events for {args.stale_seconds} seconds; possibly stalled or offline.",
        "unavailable": f"The saved {args.label} transcript is unavailable or unreadable.",
        "ended": f"{args.label} recorded {snapshot.terminal}; check the session.",
        "error": f"{args.label} recorded a session error; check the session.",
    }
    waiting_reason = snapshot.waiting_for()
    if status == "waiting" and waiting_reason is not None:
        bodies[status] = {
            "permission": f"{args.label} is blocked on tool, path, or URL access; the relay should check existing authorization.",
            "user_answer": f"{args.label} is waiting for your answer.",
            "plan_review": f"{args.label}'s plan is ready for review; execution has not been approved.",
        }[waiting_reason]
    helper_path = (
        Path(__file__).resolve().parents[2] / "bark-notify/scripts/bark_notify.py"
    )
    try:
        spec = importlib.util.spec_from_file_location("bark_notify", helper_path)
        if spec is None or spec.loader is None:
            raise RuntimeError("Bark helper is unavailable")
        helper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(helper)
        result = helper.notify(
            bodies[status],
            title=args.label,
            priority="active" if status in {"stopped", "ended"} else "timeSensitive",
            group=args.group,
        )
        return {"code": result.get("code"), "accepted": result.get("code") == 200}
    except Exception as exc:
        return {"accepted": False, "error_type": type(exc).__name__}


def _run(args: argparse.Namespace) -> None:
    """Observe the selected session and persist status without altering its store."""
    reader = _Reader(args.home / "session-state" / args.session_id / "events.jsonl")
    previous = (
        json.loads(args.state_file.read_text()) if args.state_file.exists() else {}
    )
    if previous.get("session_id", args.session_id) != args.session_id:
        raise ValueError("State file belongs to another session")
    last_key = previous.get("alert_key", previous.get("status"))
    notification = previous.get("notification")
    while True:
        try:
            snapshot = reader.refresh()
            status = snapshot.classify(
                time.time(), args.stop_grace_seconds, args.stale_seconds
            )
        except OSError:
            snapshot = reader.snapshot
            status = "unavailable"
        key = snapshot.alert_key(status)
        if not args.snapshot and key != last_key:
            notification = (
                None if status == "running" else _send(args, status, snapshot)
            )
            print(
                json.dumps({"status": status, "notification": notification}), flush=True
            )
        record = {
            "session_id": args.session_id,
            "status": status,
            "alert_key": key,
            "waiting_for": snapshot.waiting_for() if status == "waiting" else None,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "latest_event_at": snapshot.latest_at,
            "notification": notification,
            "poll_seconds": args.poll_seconds,
            "stop_grace_seconds": args.stop_grace_seconds,
            "stale_seconds": args.stale_seconds,
        }
        if args.snapshot:
            print(json.dumps(record, indent=2))
            return
        args.state_file.parent.mkdir(parents=True, exist_ok=True)
        temp = args.state_file.with_suffix(".tmp")
        temp.write_text(json.dumps(record, indent=2) + "\n")
        temp.replace(args.state_file)
        last_key = key
        time.sleep(args.poll_seconds)


def main() -> None:
    """Run requested monitoring or print a read-only snapshot without sending Bark."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("session_id", type=lambda value: str(uuid.UUID(value)))
    parser.add_argument(
        "--home", type=Path, default=os.environ.get("COPILOT_HOME", "~/.copilot")
    )
    parser.add_argument("--state-file", type=Path, required=True)
    parser.add_argument("--label", default="Copilot session")
    parser.add_argument("--group", required=True)
    parser.add_argument("--poll-seconds", type=int, default=15)
    parser.add_argument("--stop-grace-seconds", type=int, default=45)
    parser.add_argument("--stale-seconds", type=int, default=600)
    parser.add_argument(
        "--snapshot",
        action="store_true",
        help="Print status; do not notify or write state",
    )
    args = parser.parse_args()
    args.home = args.home.expanduser().resolve()
    args.state_file = args.state_file.expanduser().resolve()
    transcript = (
        args.home / "session-state" / args.session_id / "events.jsonl"
    ).resolve()
    if any(path.is_relative_to("/mnt") for path in (transcript, args.state_file)):
        parser.error("Monitoring must use local paths, not /mnt")
    if not 1 <= args.poll_seconds <= args.stop_grace_seconds < args.stale_seconds:
        parser.error("Require 1 <= poll-seconds <= stop-grace-seconds < stale-seconds")
    _run(args)


if __name__ == "__main__":
    main()
