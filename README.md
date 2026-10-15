# think-like-codex

## Evaluation status (2026-10-15)

**Treat v0.1.2 as an experimental workflow policy, not a validated reasoning-efficiency improvement. Keeping it disabled on DSH session-format-v4 installations is recommended pending compatibility and behavior fixes.**

A reproducible audit found a v4-incompatible reminder source, historical-task interference with new requests, an exploration budget that resets on each step, coarse repeated-failure grouping, and gaps in the mutation-tool gate. Some basic planning and goal/todo hooks behave as designed, but no controlled model-level experiment establishes better task success, lower token use, or shorter completion time.

See [the evaluation, scope, and reproduction instructions](docs/EVALUATION-2026-10-15.md). The audit distinguishes observed implementation defects from efficiency hypotheses and does not claim that every task becomes slower or that workflow policies cannot help.

English | [简体中文](./README.zh-CN.md)

A Codex-inspired behavior policy and Profile Bundle for DeepSeek Harness (DSH).

It helps coding agents make deliberate decisions, avoid unproductive loops, ask the user for help when evidence is insufficient, and follow a structured plan → goal → implementation workflow for complex tasks.

## Features

- Injects practical collaboration, code-generation, validation, and safety guidance.
- Applies equivalent task detection and policy guidance to both English and Chinese requests.
- Detects complex implementation requests and automatically enters DSH Plan mode.
- Adds an exploration checkpoint after 8 tools in Plan mode and enforces a hard limit after 12 tools.
- Requires an approved plan to be followed by a goal and todo list before mutation tools may run.
- Detects repeated tool failures and prompts the agent to change approach or ask the user for help.
- Adds periodic decision checkpoints during long turns.
- Distinguishes verified facts, inferences, and assumptions.
- Limits repeated attempts when an issue cannot be reproduced in the available environment.

Simple questions and explicitly read-only tasks do not automatically enter Plan mode. Users can also override automatic planning by clearly asking the agent not to plan. A direct user follow-up resets the exploration budget so a changed direction can be investigated normally.

The plugin reuses DSH's built-in `planMode`, `create_goal`, `todo_write`, `ask_user_question`, and `repeat-tool-reminder` capabilities. It does not register duplicate tools or modify session files directly.

## Installation

```bash
dsh plugin --profile web add -w think-like-codex
dsh --profile web
```

This package is a DSH Profile Bundle. Its bundled `cordis.patch.yml` mounts the plugin automatically. Replace `web` with another profile name when needed. Restart the profile host after updating host-side code.

## Configuration

The bundle installs the following defaults:

```yaml
- id: think-like-codex
  name: think-like-codex
  config:
    autoPlan: true
    complexityMinChars: 120
    stepReminderAt: 12
    stepReminderEvery: 8
    planCheckpointToolAt: 8
    planHardToolLimit: 12
    enforceGoalAfterPlan: true
    failureReminderCount: 2
```

Override the complete `config` object for `think-like-codex` in your profile's `cordis.patch.yml` if you need different thresholds.

## Uninstallation

```bash
dsh plugin --profile web remove think-like-codex
```

## License

MIT
