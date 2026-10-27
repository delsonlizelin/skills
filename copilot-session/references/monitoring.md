# Persistent monitoring and Bark alerts

Read this when the user asks the wrapper to keep watching a selected Copilot session or to notify their phone when it waits, stops, finishes, or appears down. Set up the watcher during the authorized task so alerts continue after this wrapper turn ends. A single “observe latest” request does not authorize a background monitor. A monitor does not authorize sending Copilot prompts, approving its questions, or performing project changes.

Phone alerts require a separately installed and configured `bark-notify` skill, which is not bundled in this repository. Install it beside `copilot-session`, with its helper at `bark-notify/scripts/bark_notify.py`. Discovery, reading, and `--snapshot` work without Bark. For Bark, read the `bark-notify` skill and use its maintained implementation. The helper below imports it from the adjacent canonical skill directory; do not copy credentials or create a second notification implementation. Pass the wrapper's group explicitly (`codex` for this wrapper, `claude-code` for a Claude Code wrapper). Use `active` for stopped/ended status and `timeSensitive` for waiting, stale, unavailable, or session-error status. Do not use `critical` for an ordinary stalled agent.

## Setup

The bundled `scripts/watch_session.py` follows only one named local transcript, handles incomplete final records, persists its notification state, and sends Bark on relevant state changes. It retains lifecycle metadata rather than messages or tool arguments. It requires the same Python environment that can import the Bark helper's `requests` dependency.

Identify the exact session first. Reuse any existing watcher for that UUID; inspect its known unit and state file before starting another one. For a new watcher on this host, replace `SESSION_UUID` and the human-facing label, then run the following commands with host escalation when the sandbox cannot access the user service manager or notification network:

```bash
skill_dir="$HOME/.agents/skills/copilot-session" # Set to the installed skill directory.
watch_session='SESSION_UUID'
watch_unit="copilot-watch-$watch_session"
watch_state="$HOME/.local/state/copilot-monitors/$watch_session/status.json"
watch_python="$(python -c 'import sys; print(sys.executable)')"

systemd-run --user --collect --unit="$watch_unit" \
  --description='Copilot session monitor with Bark alerts' \
  --property=Restart=on-failure --property=RestartSec=15 \
  "$watch_python" "$skill_dir/scripts/watch_session.py" \
  "$watch_session" --state-file "$watch_state" \
  --label 'PROJECT Copilot' --group codex
```

Use the resolved Python executable, not an assumed `python` command on systemd's PATH. Use the discovered `--home` for a nondefault local Copilot store. Store the status file locally outside the selected project and session store. Do not scan mounts. Service names are stable per session, not per observation. Do not create a new service for every wrapper message. If user services are unavailable, choose an existing supported background mechanism and verify survival beyond the tool call; do not claim persistence from an unverified shell background job.

The watcher starts immediately. If the session is already waiting, stopped, ended, stale, or unavailable, it alerts on that current condition. If it is running, it quietly watches for the first relevant change; an extra setup push is not required. Reusing the same status file prevents repeated notifications for a previously observed condition across restarts. A new pending question has a distinct alert key, so it can trigger even if no intermediate running state was observed between polls.

## Timing and status meaning

| Condition | Default detection | Phone message meaning |
| --- | --- | --- |
| Pending `ask_user` | Next poll, normally within 15 seconds | Waiting for the user's answer or approval |
| Saved turn end, no pending tool | 45 seconds of quiet, plus up to one poll | Turn stopped; inspect result or next step |
| Explicit session idle/shutdown/abort | Next poll | A terminal session event was recorded |
| Explicit session error | Next poll | A session error was recorded |
| No new saved activity during otherwise active work | 600 seconds, plus up to one poll | Possibly stalled or offline |
| Missing/unreadable transcript | Next poll | Saved session evidence is unavailable |

Flags `--poll-seconds`, `--stop-grace-seconds`, and `--stale-seconds` override those timings when the task needs it. A pending question takes precedence over inactivity; waiting for an answer is not a crash. Routine tool failures do not mean the session is down. The stopped-turn grace avoids treating every intermediate `assistant.turn_end` as completion, but remains an inference from saved activity. It does not prove that the whole task finished or succeeded. Prefer a live host subscription's `chat/turnComplete`, error, and input state when available and needed for stronger completion evidence.

Notifications deduplicate by condition and, for questions/stopped turns, request or turn identity. Resume re-arms subsequent alerts. Notification errors are recorded using only their exception type; do not print raw exceptions that can contain the Bark credential URL. A failed send is not retried automatically for the same condition because a timeout can occur after acceptance. Inspect and report the failure instead of sending duplicates blindly.

## Verify and operate

After starting, verify both the process and its heartbeat:

```bash
systemctl --user show "$watch_unit.service" \
  --property=ActiveState --property=SubState --property=MainPID --property=Restart
cat "$watch_state"
```

Require `ActiveState=active`, `SubState=running`, and a current `checked_at`. When a notification is due, inspect `notification.code` and `notification.accepted`; Bark application code `200` means the API accepted the push, not that the phone displayed or the user read it. If no alert is due yet, report that delivery has not been exercised rather than claiming a successful push. Do not send an unrelated live message merely to test monitoring.

The `--snapshot` option reads status and exits without sending Bark or writing the status file. It is suitable for a smoke check before launch; it does not prove the background service is running:

```bash
"$watch_python" "$skill_dir/scripts/watch_session.py" \
  "$watch_session" --state-file "$watch_state" \
  --label 'PROJECT Copilot' --group codex --snapshot
```

To inspect service logs or stop the watcher:

```bash
journalctl --user -u "$watch_unit.service" -n 20 --no-pager
systemctl --user stop "$watch_unit.service"
```

Record the exact session UUID, unit name, status path, timing, current condition, and any actual delivery result in the task's existing continuity record when needed. Reconcile that record with the current service and status file on a later wrapper turn. Do not treat an old successful Bark response as evidence of a new send. For older watchers with a `delivered` field rather than `accepted`, inspect their actual implementation and current record before interpreting it.

This transient user service survives the wrapper turn and can restart its watcher after a process failure. It does not guarantee monitoring across a host reboot, a stopped user manager, a host-wide outage, or loss of access to Bark. State those limits when relevant; do not promise a confirmed-down alert from a watcher running on the same host that went down.
