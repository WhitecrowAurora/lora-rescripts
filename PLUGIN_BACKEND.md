# Backend Plugin Runtime Draft / 后端训练插件运行时草案

本文档描述后端训练插件系统当前已经真实落地并可执行的范围。

当前状态（2026-04-22）：`tier1-tier2-readonly+tier3-modify-loss-mvp`  
当前安全边界仍属于“应用层受限执行 + 审批 / 信任 / 审计”，不是操作系统级沙箱。

## 1. 当前真实落地范围

当前已经具备：

- 插件 manifest 解析与校验
- capability / hook catalog 与策略判定
- Tier1 只读插件真实加载与执行
- Tier2 训练只读 hook 真实加载与执行
- Tier3 `modify_loss` MVP 真实加载与执行
- 事件总线、只读 payload 冻结、可变 payload 派发
- 审批存储、社区信任存储、审计日志底座
- 运行时状态 API、hook catalog API、training protocol API

当前仍未放开或仅部分预留：

- `modify_scheduler_step`
- `modify_optimizer_step`
- 操作系统级隔离
- 任意文件 / 网络访问
- 全训练器全量 Tier3 接线

## 2. 插件目录与文件结构

- 后端插件目录：`plugin/backend/<plugin-name>/`
- 清单文件：`plugin_manifest.json`
- 默认入口文件：`plugin.py`

推荐结构：

```text
plugin/backend/my-plugin/
├─ plugin_manifest.json
└─ plugin.py
```

模板与示例：

- `templates/backend-plugin-manifest.template.json`
- `templates/backend-tier1-plugin.template.py`
- `examples/backend-plugin-readonly-metrics/`
- `examples/backend-plugin-modify-loss-mvp/`

## 3. 当前 hook 与能力矩阵

### Tier1：Read-only lifecycle events

这些事件当前可直接执行，payload 为只读快照：

- `on_app_start`
- `on_config_loaded`
- `on_dataset_prepared`
- `on_train_launch`
- `on_train_complete`

### Tier2：Readonly training hooks

这些事件当前已经真实接线并执行，但仍是只读观察型 hook：

- `before_forward`
- `after_loss`
- `after_backward`
- `before_optimizer_step`
- `after_optimizer_step`

### Tier3：Flow-changing hooks

当前 catalog 中有 3 个 Tier3 hook，但运行时只放开了 1 个：

- `modify_loss`：当前运行时已支持
- `modify_scheduler_step`：当前仅 catalog 预留
- `modify_optimizer_step`：当前仅 catalog 预留

如果插件声明了当前运行时未支持的高风险 hook，运行时会拒绝加载，并给出 `unsupported_runtime_hooks:*`。

## 4. 启用、审批与信任规则

当前策略模型如下：

- Tier1：默认不需要用户批准
- Tier2：需要本地批准
- Tier3：需要本地批准 + 社区信任校验
- Developer Mode：允许为本地调试绕过批准 / 信任拦截，但仍会写审计日志

当前判定规则要点：

- 未知 capability 或未知 hook 会阻止加载
- Tier2 / Tier3 会按 `plugin_id + version + hash + signer` 绑定审批
- Tier3 会额外校验 allowlist / denylist / revoked signer
- 即使策略允许，声明了当前运行时尚未支持的 hook 也不会执行

可用接口：

- `GET /api/plugins/runtime`
- `POST /api/plugins/reload`
- `GET /api/plugins/capabilities`
- `GET /api/plugins/hooks`
- `GET /api/plugins/training_protocol`
- `POST /api/plugins/set_enabled`
- `POST /api/plugins/reset_enabled`
- `POST /api/plugins/approve`
- `POST /api/plugins/revoke_approval`
- `POST /api/plugins/developer_mode`
- `GET /api/plugins/audit`

## 5. 运行时限制

当前所有已支持的后端插件，仍走同一套受限执行器，不走普通 `importlib` 直接导入。

主要限制如下：

- 仅允许导入一小部分安全模块
- 不支持相对导入
- 不提供 `open`、`exec`、`eval`、`compile` 等高风险内建
- `print(...)` 会被重定向到插件日志

因此当前更适合做：

- 指标观察
- 训练过程审计
- 只读状态汇总
- 在 `modify_loss` 合约内做轻量 loss 变换

而不适合做：

- 任意修改宿主对象
- 访问网络
- 任意读写宿主文件
- 注入完整训练分支替换逻辑

## 6. Training Protocol 现状

训练类 hook 当前使用协议版本：

```text
tier2.training.v1
```

当前可通过 `GET /api/plugins/training_protocol` 查看：

- 每个训练 hook 的字段定义
- 字段是否必需
- 字段含义
- hook 是否为只读 / 可变

### Readonly payload

Tier1 / Tier2 事件 payload 会被冻结：

- `dict` 会变成只读映射
- `list` / `tuple` / `set` 会变成不可变结构

插件可以读取，但不能原地改写。

### `modify_loss` MVP 合约

`modify_loss` 是当前唯一真实放开的 Tier3 变更型 hook。

当前约束如下：

- hook 为独占模式，同一时刻只允许优先级最高的一个处理器生效
- 插件只能稳定地改写 `payload["mutation"]`
- 宿主当前只认可以下字段：
  - `mutation.scale`
  - `mutation.bias`
  - `mutation.reason`
  - `mutation.metadata`
- 宿主会忽略无关 payload 改动

当前宿主实际应用公式为：

```text
final_loss = loss * mutation.scale + mutation.bias
```

这意味着当前 `modify_loss` 更适合做：

- 轻量 loss 缩放
- 小幅偏置修正
- 条件诊断标记

而不适合做：

- 直接替换任意 backward 图
- 改 scheduler / optimizer 行为
- 抢占整个训练 step 生命周期

## 7. 最小 Tier1 示例

`plugin_manifest.json`：

```json
{
  "schema_version": "plugin-manifest-v1",
  "id": "community.example.readonly-train-complete",
  "name": "Readonly Train Complete",
  "version": "0.1.0",
  "entry": "plugin.py",
  "description": "Observe readonly training completion metrics.",
  "capabilities": [
    "read_step_metrics"
  ],
  "hooks": [
    {
      "event": "on_train_complete",
      "handler": "on_train_complete",
      "priority": 100
    }
  ],
  "enabled_by_default": true
}
```

`plugin.py`：

```python
def setup_plugin(context):
    context.logger.info("readonly plugin loaded")


def on_train_complete(payload, context):
    ok = payload.get("ok")
    returncode = payload.get("returncode")
    context.emit_audit(
        event_type="plugin_observed_train_complete",
        payload={
            "ok": ok,
            "returncode": returncode,
        },
    )
```

处理器签名支持：

- `handler()`
- `handler(payload)`
- `handler(payload, context)`

`setup_plugin` 为可选入口，支持：

- `setup_plugin()`
- `setup_plugin(context)`

## 8. 示例仓库说明

当前仓库内已经提供两类示例：

- `examples/backend-plugin-readonly-metrics/`
  - 演示 Tier1 生命周期事件监听
- `examples/backend-plugin-modify-loss-mvp/`
  - 演示当前唯一真实开放的 Tier3 `modify_loss` 合约

如果你想快速确认某个 hook 当前到底能不能跑，建议优先看：

1. `GET /api/plugins/hooks`
2. `GET /api/plugins/training_protocol`
3. `GET /api/plugins/runtime`

## 9. 当前边界的直白结论

当前后端插件系统已经不是“纯设计稿”，而是：

- Tier1 可执行
- Tier2 可执行，但只读
- Tier3 只开放 `modify_loss` 这一条窄口

所以现在最适合做的，是先围绕这些真实边界建设示例、文档和生态；而不是在文档里把尚未接线的高风险 hook 写成“已经可用”。
