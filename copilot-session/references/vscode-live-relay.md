# Relay through the existing VS Code owner

Read this reference when the selected Copilot conversation belongs to VS Code and the user authorizes delivering a prompt or an answer, or requests continued monitoring. The host owns the live SDK session; a protocol client submits actions to that owner without starting another Copilot writer. This preserves the existing model, effort, context, tools, and pending work.

## Discover the actual owner and endpoint

1. Start from the exact local transcript UUID already identified by `scripts/sessions.py`. Inspect only that session directory for `inuse.<pid>.lock`; a lock is a candidate owner, not proof that its PID is still the right process.
2. On the host, inspect `/proc/<pid>/cmdline` and its parent PID from `/proc/<pid>/status`. In the successful case, the lock belonged to a Copilot child using `--headless --stdio`; its parent was VS Code's `bootstrap-fork --type=agentHost` process.
3. Read only the relevant parent environment keys, especially `VSCODE_AGENT_HOST_SOCKET_PATH`, `VSCODE_AGENT_HOST_PORT`, `VSCODE_AGENT_HOST_HOST`, and whether `VSCODE_AGENT_HOST_CONNECTION_TOKEN` is configured. Do not print the whole environment, token values, IDE headers, or credential-bearing URLs. `VSCODE_AGENT_HOST_MANAGEMENT_SOCKET` is a different interface; use the protocol socket for the workflow below.
4. Prefer an already exposed endpoint. Some VS Code builds also publish owner-only endpoint metadata under their user-data directory at `agent-host/local-endpoint/entries/`; inspect that known directory only if relevant. These entries can contain a connection token, so select fields rather than dumping files. Do not start a replacement host, enable debug inspection, or alter authentication to discover a route.
5. Use the platform's escalation mechanism for host `/proc`, local-socket, or user-service operations that the sandbox cannot access. A sandbox denial is not evidence that the host lacks the capability. A Unix socket connects locally; do not route it through an external proxy. Remote provider requests still use the existing owner's configured network environment.

Paths, PIDs, lock names, host-session IDs, and chat URIs are session-specific. Discover them afresh rather than copying the values from this incident. Do not scan shared mounts.

## Inspect the live protocol before writing

The installed VS Code agent host on 2026-10-26 implemented JSON-RPC 2.0 over WebSocket and negotiated Agent Host Protocol `0.9.0`. The Python `websockets.asyncio.client.unix_connect` client was available. These are observed capabilities of that build, not a promise for every VS Code version. If negotiation or schemas differ, consult the installed `out/vs/platform/agentHost/node/agentHostMain.js` or official protocol definitions for that build; inspect bounded snippets rather than printing a minified bundle.

Use a fresh, descriptive `clientId`; do not impersonate the editor or claim its active-client identity. The read-only sequence is:

```python
import asyncio
import json
import uuid

from websockets.asyncio.client import unix_connect


async def inspect_owner(socket_path: str) -> None:
    """Inspect the existing host without submitting conversation actions."""
    async with unix_connect(
        socket_path, uri="ws://localhost/", open_timeout=8, max_size=16 * 1024 * 1024
    ) as ws:
        async def call(request_id: int, method: str, params: dict) -> dict:
            await ws.send(json.dumps({
                "jsonrpc": "2.0", "id": request_id,
                "method": method, "params": params,
            }))
            # Notifications can arrive between a request and its response.
            async with asyncio.timeout(15):
                while True:
                    message = json.loads(await ws.recv())
                    if message.get("id") == request_id:
                        if "error" in message:
                            raise RuntimeError("Owner rejected the protocol request")
                        return message["result"]

        client_id = "codex-copilot-relay-" + str(uuid.uuid4())
        initialized = await call(1, "initialize", {
            "clientId": client_id,
            "clientInfo": {"name": "codex-copilot-relay", "version": "0.1.0"},
            "protocolVersions": ["0.9.0"],
        })
        print("Protocol:", initialized["protocolVersion"])
        sessions = await call(2, "listSessions", {})
        for item in sessions["items"][:10]:
            print(json.dumps({key: item.get(key) for key in (
                "resource", "provider", "title", "status"
            )}))
```

Invoke the function with the discovered socket path. The example targets the observed endpoint without a connection token. If the owner requires a token, use its documented token transport in memory without logging or persisting it; do not disable validation. Keep raw protocol exceptions out of user-visible output when they could include credentials.

`listSessions` returns host resources such as `copilotcli:/<host-uuid>`. The host UUID can differ from the UUID of `~/.copilot/session-state/<sdk-uuid>`; searching live resources for the transcript UUID can incorrectly return no matches. Use title, project, and current conversation content to identify the candidate, then call:

```python
session_result = await call(3, "subscribe", {"channel": host_session_uri})
session_state = session_result["snapshot"]["state"]
chat_uri = session_state["defaultChat"]
chat_result = await call(4, "subscribe", {"channel": chat_uri})
chat_state = chat_result["snapshot"]["state"]
```

These calls belong inside the connected client above. Use the host-returned `defaultChat` or explicitly selected chat, never an invented URI or a review subagent chat. The session snapshot exposes `inputNeeded`; the chat snapshot exposes `activeTurn` and its `responseParts`. Read only visible messages and input requests; do not dump reasoning parts, entire snapshots, or tool arguments. If session identity remains ambiguous, resolve it before writing.

## Deliver an authorized answer

For an `ask_user` request, compare the live request's complete question and choices with the pending `ask_user` in the selected local transcript. Revalidate the live request immediately before sending; match by request and question IDs as well as content. If the question changed, disappeared, was answered, or no longer matches the user's authorization, stop rather than applying the old approval elsewhere. Preserve the user's exact answer and scope.

The observed live request has `inputNeeded[].kind == "chatInput"`, a `chat` URI, and `request` containing `id` and `questions`. After subscribing to that chat, submit a single notification through the existing connection:

```python
action = {
    "type": "chat/inputCompleted",
    "requestId": request_id,
    "response": "accept",
    "answers": {
        question_id: {
            "state": "submitted",
            "value": {"kind": "selected", "value": authorized_choice_id},
        }
    },
}
await ws.send(json.dumps({
    "jsonrpc": "2.0",
    "method": "dispatchAction",
    "params": {"channel": chat_uri, "clientSeq": 1, "action": action},
}))
```

Use the live option's ID, which need not equal its label. For a free-text answer, the value is `{"kind": "text", "value": exact_authorized_text}`. Increment `clientSeq` for each action on a connection. `chat/inputCompleted` belongs on the chat channel, not the host-session resource. Do not enable automatic approvals, modify permissions, or approve unrelated tool requests.

Check the returned `action` envelope for the matching `origin.clientId` and `origin.clientSeq`. A `rejectionReason` means rejection, even if the envelope contains the requested action. Resubscribe to the session and confirm the exact request is absent from `inputNeeded`; then inspect the selected transcript or live chat for subsequent assistant or tool activity. An acknowledgement proves host acceptance, request removal proves the question cleared, and subsequent activity establishes that work resumed. None of these alone proves implementation or tests succeeded.

If a timeout or disconnect follows submission, inspect the live request and transcript before sending again. A lost response does not imply the action failed. Do not replace the request ID or create another conversation to force progress. A small local receipt may record IDs, the authorized answer, acknowledgement, and verification results when continuity needs it; exclude tokens and raw snapshots.

## Deliver a prompt instead of an answer

Use the same owner and exact chat for new user-authorized instructions. Do not conclude that prompts are impossible because an answer is pending or the CLI lacks a `send` command. The installed host source exposed these client actions:

| Situation | Action | Relevant fields |
| --- | --- | --- |
| Start a turn in an idle chat | `chat/turnStarted` | Fresh `turnId`, ISO `startedAt`, `message: {"text": exact_prompt, "origin": {"kind": "user"}}` |
| Steer an active chat | `chat/pendingMessageSet` | Fresh `id`, `kind: "steering"`, `message: {"text": exact_prompt, "origin": {"kind": "user"}}` |
| Queue a later turn | `chat/pendingMessageSet` | Fresh `id`, `kind: "queued"`, `message: {"text": exact_prompt, "origin": {"kind": "user"}}` |

Preserve the required user-message metadata, including `origin.kind`. In this build a text-only `chat/turnStarted` was acknowledged and appeared as an active turn, but execution failed before the SDK received it because the turn starter reads `message.origin.kind`. Acceptance and an empty active turn therefore do not prove delivery. Compare with a previous valid user message, check the exact SDK transcript for the submitted `user.message` and subsequent activity, and diagnose before retrying. For the observed malformed turn, revalidating that it was the wrapper's own exact turn with no response parts and no SDK submission allowed correcting its metadata on the same turn ID; this is not permission to overwrite another client's active or already executing turn.

Send these through the same `dispatchAction` notification shape and inspect the matching acknowledgement and subsequent consumption. Inspect existing pending messages first: the steering slot is singular, so setting it can replace another participant's steering message. Preserve existing steering and queued content. In the inspected Copilot implementation, steering calls the existing SDK session's `send` with `mode: "immediate"`. A queued turn waits for the current active turn to end; queuing an approval behind a pending question can leave it blocked. When the user's answer directly matches that question, prefer the native answer flow above. Do not send both an answer and a redundant prompt just to prove relay.

The pending-answer and idle-prompt routes were exercised against the live conversation in this incident; the corrected idle prompt produced a saved SDK `user.message` and a new assistant turn. Active steering and queued-prompt behavior were verified in the installed source but were not exercised here. Recheck compatibility and verify consumption when first using them; do not describe source inspection or state-only acknowledgement as a successful prompt delivery.

## Requested monitoring

Use [monitoring.md](monitoring.md) for the reusable transcript watcher, persistent user-service setup, Bark delivery checks, and lifecycle commands. A live host subscription can provide stronger completion evidence than transcript-only inference; the monitoring guide states the fallback's timing and limits. Monitoring alone never authorizes answering questions or continuing implementation.

## Evidence from the successful relay

In a verified relay, a conversation was blocked on a user authorization question. The transcript UUID differed from the host-session UUID. Connecting to the existing owner’s Unix WebSocket, matching the live question, and dispatching `chat/inputCompleted` cleared the request. Subsequent transcript activity established that work resumed, and the existing watcher returned to `running`. No second Copilot writer, lock removal, client termination, or new conversation was needed.

The failed inference to avoid is treating transcript access as the ceiling of the skill's capability. Discover and use the current owner's controls before reporting that authorized delivery cannot be done; report a real capability or access failure precisely when it remains.
