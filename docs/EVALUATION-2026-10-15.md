# think-like-codex 0.1.2 evaluation — 2026-10-15

## Verdict / 结论

Do not deploy the current 0.1.2 broadly as a proven efficiency improvement. Keep it disabled on session-format-v4 DSH until the compatibility defect and behavioral issues below are fixed. This is a version-specific recommendation, not a claim that workflow guidance cannot help.

本次建议：其他设备先停用当前 0.1.2；不要把“流程被触发”当成“思考效率提高”。修复并完成任务级对照后再决定是否保留。

## Scope and evidence

The public index.js blob audited was `2d86ea895a033e9829a7887b05c592c1af1cc242` (package version 0.1.2). Tests executed actual callback code with synthetic agent, plan, goal and downstream-tool contexts. SDK dependencies matched the affected DSH environment: dsh-llm 0.2.0-rc.2 and schemastery 3.18.4. A local historical-budget patch was first evaluated, then all behavior cases were rerun on downloaded public source; public-source results are attached separately. No plugin was reinstalled into the live profile.

This audit uses deterministic offline hook tests and an observed runtime failure. It does NOT contain randomized model runs, task-completion-time measurements, model success-rate estimates, or token-saving estimates. The affected live failure occurred after two missing-directory grep attempts; the first result was valid, and the second triggered the plugin's repeated-failure notice. Independently invoking that notice and the two other notice paths reproduces native v4 source rejection. Private conversations, credentials and local filesystem paths are excluded from this submission.

## Observed results

| Area | Observation | Implication |
|---|---|---|
| Reminder compatibility | notice() emits source.kind=plugin. The installed DSH v4 validator explicitly rejects that legacy wrapper. Repeated-failure, periodic-step and plan-budget notices all use notice(). | This is a confirmed compatibility bug that can abort a turn. A producer-owned source kind fixes admission, but alone does not prove efficiency. |
| New requests versus history | An earlier multi-file implementation request followed by “Just answer: what does this error mean?” still enables auto-plan. A standalone simple question does not. | Classification uses joined history rather than the latest human intent. |
| Cross-step exploration budget | With the same human history present, 15 consecutive steps containing one read each produce zero denials. pre-step resets planToolCalls on every nonempty directHumanText. | The advertised persistent 12-tool budget does not work across this ordinary step pattern. |
| Within-step budget | 12 distinct reads are allowed; the thirteenth is denied. exit_plan_mode and ask_user_question remain allowed. | The counter works locally, but ignores whether each read gains new information. |
| Failure grouping | Two different missing-path failures sharing SEARCH_FAILED produce one repeated-failure reminder. | Error-code equality does not establish that the hypothesis or failure cause was repeated. |
| Interleaved failures | Failure, success, same failure produces no reminder. | It tracks consecutive failures, not a broader repeating failure pattern. This is a design limitation, not automatically a defect. |
| Goal/todo gate | After a simulated approved-plan exit, write is denied without goal/todo and allowed when both exist. | Basic workflow enforcement has useful observable behavior. |
| Shell mutation coverage | touch is denied by that gate; equivalent PowerShell Set-Content and Python file writes are allowed. No writes were executed; the test only calls the gate. | Do not present this gate as a security or comprehensive mutation boundary. |
| Guidance size | One system-policy section is 7,621 JavaScript UTF-16 code units / 10,821 UTF-8 bytes; a sampled step reminder is 761 code units. | Additional context exists, but bytes are not model tokens, and caching may alter cost. Net efficiency is unmeasured. |
| Basic controls | A simple request does not auto-plan; a complex request does; an explicit no-plan request does not. | The idea has working mechanisms, which should be retained only where task-level benefits are demonstrated. |

## Reproduction

Use an isolated copy of this repository with the same DSH SDK dependencies available; do not reinstall the plugin into an active profile merely to test it. One way to prepare the isolated checkout is:

```sh
npm install --no-save --package-lock=false @deepseek-ai/dsh-llm@0.2.0-rc.2 @deepseek-ai/schemastery@3.18.4
node docs/evaluate-hooks.mjs
```

The harness runs callbacks against fake tools. It does not execute mutation commands or call a model. `evaluation-results.json` records the observed outputs from the public-source run. These are behavior probes, not a model-performance benchmark. The v4 compatibility finding additionally uses the native validator from the installed DSH package; that local installation is not included here.

## What would establish an efficiency benefit?

After fixing compatibility and the above defects, compare: (A) stock DSH, (B) a short advisory policy without hard workflow gates, (C) this plugin. Pin model/version/settings/tools, use identical isolated task snapshots and independent repeated runs, and randomize run order. Include routine edits, multi-file fixes, ambiguous diagnostics, missing paths and recovery, and tasks that legitimately require more exploration.

Measure accepted task completion first; then model input/output usage (cached separately), elapsed active time, tool calls, user interruptions, false planning triggers, and recovery after failures. Count timeouts, aborts and incomplete tasks rather than excluding them. Choose success criteria before looking at results, report sample sizes and variability, and prefer success-adjusted cost/time over a raw reduction in tool calls.

No percentage uplift is claimed here. The present evidence supports disabling this release, not a blanket conclusion that its future design cannot improve DSH.
