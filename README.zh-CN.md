# think-like-codex

## 评估状态（2026-10-15）

**0.1.2 应视为实验性的流程策略插件，目前不能称为经过验证的“思考效率提升”。在使用 session format v4 的 DSH 上，建议先停用，等待兼容性和行为缺陷修复。**

可复现实测发现：提醒消息来源与 v4 不兼容、旧复杂任务会干扰新的简单问题、探索预算每步被历史消息重置、失败分类过粗，以及写操作门槛覆盖不完整。部分规划与 goal/todo 钩子符合设计，但尚无模型层面的受控对照实验，能够证明成功率提升、token 减少或完成更快。

详见[评估范围、证据和复现方法](docs/EVALUATION-2026-10-15.md)。这些结论不表示所有任务都会变慢，也不表示流程提醒思路本身无效。

[English](./README.md) | 简体中文

面向 DeepSeek Harness（DSH）的 Codex 风格行为策略与 Profile Bundle。

它帮助编码 Agent 更审慎地做决策、避免无效循环，在证据不足时主动向用户求助，并让复杂任务遵循“计划 → goal → 实施”的规范流程。

## 功能

- 注入实用的协作、代码生成、验证和安全规范；
- 对中文和英文请求应用对等的任务识别与策略提示；
- 识别复杂实现请求并自动进入 DSH Plan mode；
- Plan mode 使用 8 次探索工具后要求收敛，达到 12 次硬上限后只允许提交计划或向用户求助；
- 计划获批后，要求先创建 goal 和 todo，再允许修改代码或外部状态；
- 检测同类工具连续失败，提醒改变方法或主动向用户求助；
- 长回合中周期性注入决策检查；
- 强制区分已验证事实、推断和假设；
- 在当前环境无法复现问题时限制重复尝试。

简单问答和明确只读的任务不会自动进入 Plan mode。用户也可以明确要求“不要计划”来覆盖自动规划。用户直接补充消息后会重置探索预算，使方向发生变化时仍有正常调查空间。

插件复用 DSH 自带的 `planMode`、`create_goal`、`todo_write`、`ask_user_question` 和 `repeat-tool-reminder`，不注册重复工具，也不直接修改 session 文件。

## 安装

```bash
dsh plugin --profile web add -w think-like-codex
dsh --profile web
```

这是一个 DSH Profile Bundle，包内的 `cordis.patch.yml` 会自动挂载插件。需要安装到其他 profile 时，将 `web` 换成对应名称。宿主端代码更新后需要重启该 profile。

## 配置

Bundle 默认安装以下配置：

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

如果需要调整阈值，请在 profile 的 `cordis.patch.yml` 中为 `think-like-codex` 覆盖完整的 `config` 对象。

## 卸载

```bash
dsh plugin --profile web remove think-like-codex
```

## 许可证

MIT
