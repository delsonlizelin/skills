"""Verify blocking controls and partial transcript records without sending Bark."""

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "watch_session.py"
SPEC = importlib.util.spec_from_file_location("copilot_watch", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
WATCH = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(WATCH)
STAMP = "2026-10-31T14:00:00Z"


def event(kind: str, **data: object) -> dict[str, object]:
    """Build a public event envelope without private tool payloads."""
    return {"type": kind, "timestamp": STAMP, "data": data}


class WaitingControls(unittest.TestCase):
    def test_permission_waits_immediately_and_clears(self) -> None:
        snapshot = WATCH._Snapshot()
        snapshot.accept(event("permission.requested", requestId="path-1"))
        self.assertEqual(snapshot.classify(10**12, 45, 600), "waiting")
        self.assertEqual(snapshot.waiting_for(), "permission")
        snapshot.accept(event("permission.completed", requestId="path-1"))
        self.assertIsNone(snapshot.waiting_for())

    def test_new_permission_has_a_distinct_alert_key(self) -> None:
        snapshot = WATCH._Snapshot()
        snapshot.accept(event("permission.requested", requestId="first"))
        first = snapshot.alert_key("waiting")
        snapshot.accept(event("permission.completed", requestId="first"))
        snapshot.accept(event("permission.requested", requestId="second"))
        self.assertNotEqual(first, snapshot.alert_key("waiting"))

    def test_question_and_plan_review_both_block(self) -> None:
        for tool, reason in [
            ("ask_user", "user_answer"),
            ("exit_plan_mode", "plan_review"),
        ]:
            with self.subTest(tool=tool):
                snapshot = WATCH._Snapshot()
                snapshot.accept(
                    event("tool.execution_start", toolCallId="tool", toolName=tool)
                )
                self.assertEqual(snapshot.classify(10**12, 45, 600), "waiting")
                self.assertEqual(snapshot.waiting_for(), reason)
                snapshot.accept(event("tool.execution_complete", toolCallId="tool"))
                self.assertIsNone(snapshot.waiting_for())

    def test_ordinary_tool_is_not_a_question(self) -> None:
        snapshot = WATCH._Snapshot()
        snapshot.accept(
            event("tool.execution_start", toolCallId="read", toolName="view")
        )
        self.assertIsNone(snapshot.waiting_for())
        self.assertEqual(snapshot.classify(10**12, 45, 600), "stale")

    def test_resumed_user_message_rearms_after_shutdown(self) -> None:
        snapshot = WATCH._Snapshot()
        snapshot.accept(event("permission.requested", requestId="old"))
        snapshot.accept(event("session.shutdown"))
        self.assertEqual(snapshot.classify(0, 45, 600), "ended")
        snapshot.accept(event("user.message"))
        self.assertEqual(snapshot.classify(0, 45, 600), "running")
        self.assertIsNone(snapshot.waiting_for())

    def test_reader_waits_for_complete_jsonl_record(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "events.jsonl"
            record = json.dumps(event("permission.requested", requestId="partial"))
            path.write_text(record)
            reader = WATCH._Reader(path)
            self.assertIsNone(reader.refresh().waiting_for())
            with path.open("a") as stream:
                stream.write("\n")
            self.assertEqual(reader.refresh().waiting_for(), "permission")
            with path.open("a") as stream:
                stream.write(
                    json.dumps(event("permission.completed", requestId="partial"))
                    + "\n"
                )
            self.assertIsNone(reader.refresh().waiting_for())


if __name__ == "__main__":
    unittest.main()
