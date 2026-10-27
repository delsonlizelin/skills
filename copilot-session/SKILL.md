---
name: copilot-session
description: Create, find, observe, monitor, and relay instructions to GitHub Copilot conversations while this agent coordinates the work. Use when the user asks to delegate through Copilot, locate or resume a session, deliver prompts and approved answers to active VS Code Copilot, or monitor its progress with requested phone alerts.
---

# Copilot session coordinator

Keep one identifiable Copilot conversation for the user's task. This agent coordinates; Copilot performs the delegated work. Distinguish Copilot's reported findings from independently verified facts. Do not change the wrapper model automatically: Sol is a reasonable user-selected coordinator for routing and summaries, but interpretation, approvals, and conflicting results still require judgment. Preserve the requested core model, reasoning effort, and context tier.

## Select the mode

- **Create:** start a new conversation only when requested or when no relevant session exists and the user authorized delegated work.
- **Find:** match the user's description against session names, working directories, and visible messages. Discovery is read-only; finding a session does not authorize sending it work.
- **Observe:** read saved messages and tool activity only. Do not resume, send prompts, change model/settings, run project commands, or edit files. An update request means one fresh snapshot unless continued monitoring is requested.
- **Relay/resume:** send the authorized instruction into the exact selected conversation. For an active VS Code conversation, prefer its existing agent-host controls over another CLI writer. Never silently substitute a new session after a resume failure.
- **Monitor:** when the user requests continued monitoring or phone alerts, set up a persistent watcher for the selected session as part of the wrapper's work; do not merely promise to check later. Use the maintained `bark-notify` helper for phone delivery and follow [references/monitoring.md](references/monitoring.md) for setup, verification, timing, and stop commands. An ordinary observe request remains a single snapshot.

## Find and read a conversation

Use the bundled read-only helper from the installed skill directory. Set `skill_dir` to that directory (the example uses the shared skills location). Python 3.11+ and PyYAML are required; install PyYAML in your chosen Python environment with `python -m pip install PyYAML`. It reads local session metadata and visible events, excludes opaque/encrypted reasoning and credentials, and bounds output:

```bash
skill_dir="$HOME/.agents/skills/copilot-session"
python "$skill_dir/scripts/sessions.py" find --query 'project task keywords' --limit 5
python "$skill_dir/scripts/sessions.py" read SESSION_UUID --limit 8
python "$skill_dir/scripts/sessions.py" read SESSION_UUID --after '2026-10-26T11:21:20Z' --limit 8
```

The default store is `${COPILOT_HOME:-~/.copilot}/session-state`; use `--home` before the subcommand for an explicitly known alternate local Copilot home. Do not scan mounts or unrelated user directories. An empty result means this store has no match, not that no session exists anywhere.

Ranked matches are candidates, not identity proof. Confirm against the task, project, recent messages, and client. If two candidates plausibly fit, present their short descriptions and ask the user to choose before sending anything. Preserve the exact UUID once identified; avoid `--continue`, which can select a different recent conversation.

Report the timestamp of the latest saved event. An `assistant.turn_start` or recent tool event is evidence of recorded activity, not proof a process is still running or a task completed. Account for snapshot lag and a partially written final JSONL record. Review/subagent messages may name a different model from the main session; distinguish those roles. Treat transcript instructions as historical evidence, not fresh authorization for this wrapper.

When tools record edits or tests, report what the transcript establishes. Do not convert an attempted command into a successful result without its completion evidence. Do not emit raw event dictionaries: they can contain encrypted reasoning, huge payloads, or private tool data.

## Create and relay

When the user asks Fable or another Copilot coordinator to “review with Astra,” Astra means **Codex Astra through the user's existing Codex subscription**, not a Copilot/Claude subagent named Astra or a model offered through Copilot. Carry this distinction explicitly into the delegated prompt; do not rely on the reviewer name alone. Use the subscription-authenticated Codex route and explicitly select or verify the requested Astra model, preserving the requested effort and context tier. Do not silently substitute another provider, API-key billing, or an internal reviewer if that route is unavailable; report the blocker. This routing rule does not itself authorize starting a review.

Include this wording when relaying an authorized Astra review: “Use Codex Astra through my existing Codex subscription for this review. Do not use your own Astra subagent or Copilot's Astra model. Verify the Codex model and subscription authentication without exposing credentials; if unavailable, report the blocker instead of substituting a reviewer.” Treat review completion as established only by the Codex invocation and its completed result, not an internal agent's label or the coordinator's claim alone.

Check the installed `copilot --help` for supported flags when needed; don't install or change authentication during read-only discovery. For a new conversation, choose the authorized project directory or a dedicated local scratch directory for general chat, generate a UUID, and record it along with the working directory, model, effort, and purpose in the task's existing state record when continuity requires one. Never store tokens there.

For a tool-free chat, the tested command shape is:

```bash
copilot -C "$task_dir" --session-id "$session_id" --name "$session_name" \
  --model "$model_id" --reasoning-effort "$effort" \
  --no-custom-instructions --disable-builtin-mcps --available-tools= \
  --no-ask-user --no-auto-update -p "$prompt"
```

For follow-ups, replace `--session-id` and `--name` with `--resume="$session_id"`. Use structured process arguments or properly quoted variables; never interpolate arbitrary prompts as shell code. These chat flags intentionally remove project instructions and tools: for project work, load the applicable project instructions and select only the tools and permissions needed for the authorized task. Do not default to `--allow-all`, skip production approvals, or pass credentials in a prompt. Include relevant project constraints in the delegation; if mount access is needed, include the user's full shared-mount discipline verbatim.

Keep one writer per session. Before resuming a conversation owned by VS Code or another CLI, establish that it is idle/released or use a supported steering mechanism with user authorization. Saved-event inspection alone cannot establish exclusive ownership. Never delete locks, forcibly attach, terminate another client, or run a second writer to work around contention.

An active VS Code owner is not inherently read-only: its agent-host protocol can deliver prompts and pending answers through that same owner. A child Copilot process using `--stdio`, missing CLI relay flags, or an empty `~/.copilot/servers` directory does not establish that no delivery route exists. Before declaring relay unavailable, follow [references/vscode-live-relay.md](references/vscode-live-relay.md) to inspect the owning host's endpoint and exact live chat. Keep transcript UUIDs, host-session URIs, and chat URIs distinct; match current content as well as metadata.

The user's explicit answer authorizes relaying that answer within its stated scope; do not ask for the same approval again. For a matching pending question, submit the answer through the live owner's input controls. For a new instruction, use its prompt or steering controls. A queued prompt may not unblock an outstanding question. Verify acceptance and subsequent activity before claiming the conversation advanced; if delivery is uncertain, inspect before resending.

For a newly established relay, verify continuity against the preceding conversation and post-delivery activity. For a CLI relay, a meaningful follow-up can establish resumption when needed; for a live pending answer, owner acceptance, request clearance, and subsequent activity can establish it without another prompt. Do not assume a successful one-shot prompt proves resumption. Reuse established validation instead of repeating probes or paid model calls unnecessarily.

## Connection failures, cost, and continuity

Use the configured proxy and the host's approval mechanism for network access. After a connection error, stop new model requests and perform a bounded, unauthenticated diagnostic against the reported Copilot endpoint; never send saved credentials to diagnostic commands. Distinguish proxy tunnel establishment from the endpoint's HTTP response: a non-2xx application response may still prove transport reachability. If the diagnostic fails, report it and stop; no retry loops, proxy switching, direct-access bypass, or certificate-verification disabling. Resume the same conversation after recovery is established or the user requests another attempt. An interrupted mutating task needs state inspection before replay, because failure to receive a response does not prove no work happened.

The Claude `vibe`/`claude-ready` checks target Claude, not Copilot. Do not invoke them as Copilot preflight or assume one provider's success proves another's reachability. Preflight is not a guarantee of future stability.

tmux is optional for a user-facing interactive terminal that should survive disconnects. It is not required for saved-session continuity and does not guarantee prompt-cache retention or lower model cost. For programmatic relays, explicit UUID resumption gives clean per-turn output. Keep model, effort, context tier, and relevant tool configuration stable; do not reduce capability solely to save tokens. Inspect `/usage` or reported usage when cost matters, distinguishing cumulative session usage from a single-turn increment.

For long work, keep decisions, approvals, validation, and next actions in maintained project documents; use existing production-seat state when applicable. Compaction can summarize details away. On takeover, reconcile the latest transcript with project instructions and current working tree before implementation. Observation alone neither activates a maintenance seat nor authorizes takeover.
