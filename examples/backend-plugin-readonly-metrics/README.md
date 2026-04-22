# Backend Plugin Example: Readonly Metrics

这是一个 Tier1 后端插件示例骨架。

它的目标不是做复杂功能，而是演示一套最小可运行的只读插件仓库应该怎么组织：

- `plugin_manifest.json` 声明插件身份、能力与监听事件
- `plugin.py` 提供 `setup_plugin(...)` 和事件处理器
- 通过 `context.logger` 写日志
- 通过 `context.emit_audit(...)` 写插件自己的审计事件

## 目录结构

```text
backend-plugin-readonly-metrics/
├─ README.md
├─ plugin_manifest.json
└─ plugin.py
```

## 如何本地测试

1. 复制整个目录到：

```text
plugin/backend/backend-plugin-readonly-metrics/
```

2. 启动后端或调用：

```text
POST /api/plugins/reload
```

3. 查看运行时状态：

```text
GET /api/plugins/runtime
```

4. 查看审计日志：

```text
GET /api/plugins/audit
```

## 这个示例做了什么

- 启动时打印一条插件加载日志
- 在配置载入时记录训练类型与配置项数量
- 在训练启动时记录训练类型、训练器路径和 world size
- 在训练完成时记录返回码与成功状态

## 当前选用的事件

这个示例只使用当前仓库里已经真实接线的事件：

- `on_app_start`
- `on_config_loaded`
- `on_train_launch`
- `on_train_complete`

这样你复制到真实插件目录后，能更容易看到它马上工作。

## 适合拿它改造成什么

- 只读统计采集
- 训练里程碑通知
- 运行时观察插件
- 审计补充插件

## 不适合拿它做什么

Tier1 仍然不适合：

- 修改 loss
- 修改 optimizer / scheduler 行为
- 访问网络
- 直接读写宿主任意文件

这些不属于这个 Tier1 示例的目标范围。

如果你想看当前仓库里已经补上的高风险示例，请继续看：

- `examples/backend-plugin-modify-loss-mvp/`

它演示的是当前唯一真实开放的 Tier3 窄口：`modify_loss`。
