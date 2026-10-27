"""Read bounded, visible Copilot session activity without modifying its store."""

import argparse
import json
import os
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import yaml


def _events(folder: Path) -> list[dict[str, Any]]:
    """Read complete events from a live transcript snapshot."""
    path = folder / "events.jsonl"
    if not path.exists():
        return []
    result = []
    with path.open() as stream:
        for line in stream:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(event, dict):
                result.append(event)
    return result


def _metadata(folder: Path) -> dict[str, Any]:
    """Read descriptive metadata without opening credential configuration."""
    path = folder / "workspace.yaml"
    if not path.exists():
        return {}
    data = yaml.safe_load(path.read_text())
    return data if isinstance(data, dict) else {}


def _visible(event: dict[str, Any], chars: int) -> dict[str, Any] | None:
    """Select only visible message text or a short tool activity description."""
    kind = event.get("type", "")
    data = event.get("data") or {}
    row = {"type": kind, "timestamp": event.get("timestamp")}
    if kind in ("user.message", "assistant.message") and data.get("content"):
        content = data["content"]
        if not isinstance(content, str):
            return None
        row.update(model=data.get("model"), content=content[:chars])
        if len(content) > chars:
            row["truncated"] = True
    elif kind == "tool.execution_start":
        arguments = data.get("arguments") or {}
        detail = arguments.get("description") or arguments.get("path") or ""
        row.update(
            tool=data.get("toolName"), model=data.get("model"), detail=str(detail)[:300]
        )
    else:
        return None
    return row


def _instant(value: str) -> datetime:
    """Parse ISO timestamps including UTC Z notation."""
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("Timestamp must include a timezone")
    return parsed


def _find(root: Path, query: str, limit: int) -> dict[str, Any]:
    """Rank sessions using metadata and visible conversation text."""
    terms = set(re.findall(r"\w+", query.casefold()))
    candidates = []
    if not root.exists():
        return {"sessions": [], "note": "Local session store not found"}
    for folder in root.iterdir():
        if folder.is_symlink() or not folder.is_dir():
            continue
        try:
            uuid.UUID(folder.name)
        except ValueError:
            continue
        meta = _metadata(folder)
        events = _events(folder)
        messages = [
            e for e in events if e.get("type") in ("user.message", "assistant.message")
        ]
        title = str(meta.get("name", ""))
        cwd = str(meta.get("cwd", ""))
        texts = [str(e.get("data", {}).get("content", "")) for e in messages]
        body = " ".join(texts).casefold()
        header = f"{title} {cwd}".casefold()
        score = sum(3 * (t in header) + (t in body) for t in terms)
        if terms and not score:
            continue
        latest = events[-1] if events else {}
        last_text = next((t for t in reversed(texts) if t), "")
        candidates.append(
            {
                "id": folder.name,
                "name": title,
                "cwd": cwd,
                "client": meta.get("client_name"),
                "score": score,
                "latest_event": latest.get("type"),
                "latest_at": latest.get("timestamp", ""),
                "last_message_excerpt": last_text[:500],
            }
        )
    candidates.sort(key=lambda row: (row["score"], row["latest_at"]), reverse=True)
    return {"sessions": candidates[:limit], "matching_sessions": len(candidates)}


def main() -> None:
    """Print a read-only Copilot session search or transcript snapshot.

    Raises:
        ValueError: If a session ID or timestamp is invalid, or the store is on a mount.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--home", default=os.environ.get("COPILOT_HOME", "~/.copilot"))
    commands = parser.add_subparsers(dest="command", required=True)
    find = commands.add_parser("find")
    find.add_argument("--query", default="")
    find.add_argument("--limit", type=int, default=5)
    read = commands.add_parser("read")
    read.add_argument("session_id")
    read.add_argument("--after")
    read.add_argument("--limit", type=int, default=8)
    read.add_argument("--chars", type=int, default=2500)
    args = parser.parse_args()
    root = Path(args.home).expanduser().resolve() / "session-state"
    if root.is_relative_to("/mnt"):
        raise ValueError("Session discovery must use a local store, not /mnt")
    if not 1 <= args.limit <= 50:
        parser.error("--limit must be between 1 and 50")
    if args.command == "find":
        result = _find(root, args.query, args.limit)
    else:
        session_id = str(uuid.UUID(args.session_id))
        folder = root / session_id
        if folder.is_symlink() or not folder.is_dir():
            parser.error("Session not found as a local directory")
        if not 1 <= args.chars <= 20000:
            parser.error("--chars must be between 1 and 20000")
        events = _events(folder)
        after = _instant(args.after) if args.after else None
        visible = []
        for event in events:
            if after and _instant(event["timestamp"]) <= after:
                continue
            row = _visible(event, args.chars)
            if row:
                visible.append(row)
        latest = events[-1] if events else {}
        result = {
            "id": session_id,
            "latest_at": latest.get("timestamp"),
            "latest_event": latest.get("type"),
            "matching_events": len(visible),
            "omitted_events": max(0, len(visible) - args.limit),
            "events": visible[-args.limit :],
            "note": "Saved snapshot; event activity does not prove a live process or completion.",
        }
    print(json.dumps(result, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
