# Plugin System Roadmap (Draft) / 插件系统开发路线图（草案）

> 目标：在不牺牲训练安全性的前提下，逐步开放通用插件能力。  
> 当前 `PLUGIN.md` 仅覆盖社区 UI 插件；本文档面向后端训练插件。

## 当前进度（2026-04-22）

目前已经不再是“只有设计，没有执行”：

- manifest schema / capability catalog / hook catalog 已落地
- policy engine / approval store / trust store / audit log 已落地
- Tier1 只读插件已经可真实加载与执行
- Tier2 训练只读 hook 已可真实加载与执行
- Tier3 目前只开放 `modify_loss` 这一条 MVP 窄口
- `modify_scheduler_step` / `modify_optimizer_step` 仍处于 catalog 预留阶段

这意味着路线图依然成立，但当前起点已经前进到：

```text
Tier1 可执行 + Tier2 只读可执行 + Tier3 modify_loss MVP
```

## 0. 设计原则

1. 权限按 `capability` 粒度划分。  
2. 默认拒绝，未声明能力一律不可用。  
3. 所有授权与 `plugin_id + version + hash + signer` 绑定。  
4. 插件执行必须可审计、可追踪、可复现。  
5. 先把真实边界做窄、做稳，再考虑继续开放。  

## 1. 权限与信任三级模型

### Tier 1: Read-only Event Plugins

- 能力示例：`read_runtime_stats`、`read_step_metrics`、`read_dataset_meta`
- 约束：只拿不可变快照
- 当前状态：已落地并真实执行

### Tier 2: Hook Plugins

- 能力示例：`hook_before_forward`、`hook_after_loss`、`hook_after_backward`
- 约束：当前仍保持只读观察语义
- 当前状态：后端执行路径已落地，但用户批准与新 UI 管理体验仍要继续补齐

### Tier 3: Training-Flow Plugins

- 能力示例：`modify_loss`、`modify_optimizer_step`、`modify_scheduler_step`
- 约束：必须签名 / 哈希 / 社区核验一致，且保留紧急撤销
- 当前状态：仅 `modify_loss` MVP 已落地，且当前宿主只认可仿射 loss 变换

### Developer Mode

- 允许本地调试时加载未签名插件
- 仍需强提示、强审计
- 默认关闭

## 2. 你之前提到的 8 个关键点

1. 权限单位改为 capability 粒度  
2. 签名材料覆盖入口代码 + 依赖锁 + 清单  
3. 运行时隔离：只读事件传不可变快照  
4. 授权按版本失效  
5. 社区核验支持 denylist / key revoke  
6. 全链路审计日志  
7. Hook 顺序与冲突策略固定化  
8. 开发者模式强提醒与可追踪  

这些里面，前 1-7 基础骨架都已经有实现落点；后续更多是在补前端体验、样例生态和高风险能力的真正放开。

## 3. 当前建议顺序

后续继续推进时，建议按下面顺序做：

1. 持续回补文档、模板、示例仓库
2. 把 `modify_loss` 从单一训练器扩到核心训练主线
3. 新 UI 接入插件宿主与审批 / 状态展示
4. 再评估是否继续放开 `modify_scheduler_step` / `modify_optimizer_step`

## 4. 分阶段实施

### Phase A：基础设施

- 已完成：
  - `plugin manifest schema`
  - `event bus`
  - `hook catalog v1`
  - `policy engine`
  - Tier1 只读执行

### Phase B：授权体系

- 已部分完成：
  - `approval store`
  - 后端审批接口
  - Tier2 后端执行路径
- 仍需补：
  - 新 UI 授权宿主
  - 更清晰的权限展示与风险文案

### Phase C：签名与社区核验

- 已部分完成：
  - canonical hash
  - trust store
  - allowlist / denylist / revoked signer
  - Tier3 `modify_loss` MVP
- 仍需补：
  - 更完整的签名方案
  - 更明确的社区分发 / 核验流程
  - 更多高风险 hook 的真实接线

### Phase D：开发者模式与治理

- 仍需继续完善：
  - dev mode 体验与强提醒
  - 插件审计面板
  - 社区插件提交与复核流程文档

## 5. Hook Catalog v1

### Tier1：Read-only events

- `on_app_start`
- `on_config_loaded`
- `on_dataset_prepared`
- `on_train_launch`
- `on_train_complete`

### Tier2：Readonly training hooks

- `before_forward`
- `after_loss`
- `after_backward`
- `before_optimizer_step`
- `after_optimizer_step`

### Tier3：Flow-changing hooks

- `modify_loss`
- `modify_scheduler_step`
- `modify_optimizer_step`

注意：

- 当前真正 runtime-supported 的 Tier3 hook 只有 `modify_loss`
- `modify_scheduler_step` / `modify_optimizer_step` 目前仍是“catalog 中可见，但运行时不执行”

## 6. 冲突与异常策略

1. 同一挂载点按 `priority` 从高到低执行  
2. 默认失败隔离：单插件异常不拖垮主流程  
3. 高风险挂载点可启用独占模式  
4. `modify_loss` 当前已经按独占模式执行  

## 7. 建议的代码落点

- `mikazuki/plugins/manifest_schema.py`
- `mikazuki/plugins/runtime.py`
- `mikazuki/plugins/event_bus.py`
- `mikazuki/plugins/hook_catalog.py`
- `mikazuki/plugins/policy.py`
- `mikazuki/plugins/enabled_store.py`
- `mikazuki/plugins/approval_store.py`
- `mikazuki/plugins/signature_verify.py`
- `mikazuki/plugins/audit_log.py`
- `mikazuki/plugins/training_protocol.py`
- `mikazuki/plugins/training_hooks.py`

## 8. 现在最务实的结论

当前最适合做的，不是立刻把 Tier3 整体放开，而是：

- 先把现有 Tier1 / Tier2 / `modify_loss` MVP 的文档和示例补齐
- 先把新 UI 的插件宿主与审批展示做好
- 先把核心训练主线的接线覆盖面补齐

这样后面再往上开口，风险和维护成本都会低很多。
