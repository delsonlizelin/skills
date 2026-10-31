# Project CLI sessions and access

Read this for a new project conversation or when relaying through an existing CLI owner. Check the installed CLI's help before relying on flags or permission-menu labels; they vary by version.

## Start with the authorized access

Delegating project investigation normally authorizes the tools needed for that investigation. Prefer `--allow-all-tools` for that authorized work rather than starting an unattended session in per-command manual approval. This is an access mechanism, not permission to implement a plan, deploy, change accounting policy, read secrets, or exceed project scope.

Tool approval does not grant paths. Use `--add-dir` for the requested project, referenced repositories, the dedicated relay folder, and the resolved interpreter/tool runtime directories needed by the task. A Python symlink can resolve outside otherwise allowed roots and stop the session before the read-only script starts. Pregrant the narrow runtime path or approve that exact pending path for the session under existing authorization.

When the user explicitly authorizes unrestricted path access, apply `--allow-all-paths` too; do not ask again for settled access. Keep URLs separately scoped. The UI's `Allow All` may combine tools, paths and URLs, while `--allow-all-tools` alone preserves path/URL checks. Its footer can still say `Manual Approval`; verify actual launch arguments and subsequent tool completions before deciding a setting failed. A platform rejection remains binding until a safer alternative or additional authorization addresses it.

For an interactive planning session that can ask questions, the command shape is:

```bash
copilot -C "$project_dir" --session-id "$session_id" --name "$session_name" \
  --model "$model_id" --reasoning-effort "$effort" --context "$context_tier" \
  --plan --allow-all-tools --no-auto-update --disable-builtin-mcps \
  --add-dir "$reference_repo" --add-dir "$relay_dir" \
  --add-dir "$runtime_dir" -i "$prompt"
```

Set variables from the user's task and verified installed model catalog; preserve the requested family, effort and context. Omit unused directory flags. Do not use the tool-free example's `--available-tools=`, `--no-custom-instructions`, or `--no-ask-user` for project research or an authorized grill. Keep applicable project instructions enabled. Grant folder trust for this session rather than silently persisting trust for future tasks. Do not grant broad private configuration directories merely to read a few instructions: stage the necessary non-secret files in the relay folder when needed.

Use a persistent owner such as a named tmux session for interactive questions. Build arguments with a structured process API or safely quoted variables. For arbitrary multiline prompts, read the prompt file into an argument; do not interpolate its contents as shell code. Record the UUID, owner, project, access flags, model/effort/context and task purpose. Verify `session.start` settings, receipt of the actual user brief, subsequent activity and the live process. Install the requested monitor immediately and verify its heartbeat.

## Relay through that owner

Inspect the live input state before typing. A CLI can open a question while an update is being prepared; the same Enter key can then accept an unrelated default. For tmux, paste literal text using a named buffer and bracketed paste, allow the interface to redraw between keys, and inspect the selected option before committing a material answer. Read the full form: property order need not match the prose or a previous question.

The user's explicit answer authorizes its delivery. Match every substantive selected value and note against the recorded `ask_user` completion, confirm the request cleared, and observe subsequent activity. An arrow moving, a paste succeeding or a `[pending]` message does not establish consumption. Preserve existing queued/steering content; recall and replace only the wrapper's own pending update when appropriate. Do not submit a default architecture or valuation answer to send paths, a deadline or a progress note.

Avoid declining a question merely to communicate: some clients describe a decline as making a best guess on autopilot. If the user requests replanning rather than choosing an option, use an explicit free-text response that rejects the proposed choice and defers other material fields. If a cancellation is necessary, state that no business decision was supplied and verify that the correction was consumed before allowing dependent work to continue.

Changing launch-only permissions may require a graceful exit and exact-UUID resume. First establish that the writer is idle, release it through its own normal exit, verify it exited, then use `--resume="$session_id"` with the same model, effort, context and task constraints plus the authorized access flag. Do not create a replacement conversation or a second writer. Use a meaningful continuation and verify receipt; do not run an extra paid probe merely to prove an already-established route.

## Finish planning without executing

Plan mode may block writes to repository documentation even when the user requested a saved plan. Let the delegate save its session plan, then have the wrapper place the reviewed artifact in the authorized repository destination; no extra approval is needed for that ordinary document write. Preserve linked review reports when they are necessary to interpret the plan. A future executor should read one coherent plan, not reconcile obsolete instructions against an overriding appendix or reconstruct the chat.

At `exit_plan_mode`, choose the explicit exit-without-running action for a plan-only task. Do not accept an execution or autopilot option to dismiss the screen. To request revisions, use the owner's feedback control; cancelling that dialog is not approval of the plan or its defaults. Report a review's actual verdict and distinguish final corrections from a subsequent reviewer pass that never happened.

Stop the requested watcher when the completed artifact and final state are verified. Keep the saved conversation and lifecycle metadata; do not delete the session or recovery material.
