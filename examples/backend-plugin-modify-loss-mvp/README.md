# Backend Plugin Example: Modify Loss MVP

这是一个 Tier3 后端插件示例骨架。

它的目标不是演示“完整接管训练流程”，而是演示当前仓库里唯一真实开放的高风险变更型 hook：

- `modify_loss`

## 目录结构

```text
backend-plugin-modify-loss-mvp/
├─ README.md
├─ plugin_manifest.json
└─ plugin.py
```

## 这个示例做了什么

- 在 `modify_loss` 事件里写入 `payload["mutation"]`
- 把 loss 按示例比例做一次仿射变换
- 写入 `reason` 和 `metadata`
- 额外写一条插件审计日志

宿主当前只认可下面这几个字段：

- `mutation.scale`
- `mutation.bias`
- `mutation.reason`
- `mutation.metadata`

宿主当前实际应用公式：

```text
final_loss = loss * mutation.scale + mutation.bias
```

## 为什么叫 MVP

因为当前 Tier3 还没有完全放开。

当前真实边界是：

- `modify_loss` 已有运行时支持
- `modify_scheduler_step` 仍未接线
- `modify_optimizer_step` 仍未接线
- 当前 `modify_loss` 是独占 hook，一次只允许优先级最高的一个处理器生效

## 如何本地测试

1. 复制整个目录到：

```text
plugin/backend/backend-plugin-modify-loss-mvp/
```

2. 由于这个示例默认是未签名插件，最简单的本地测试方式是先启用开发者模式：

```text
POST /api/plugins/developer_mode
{
  "enabled": true
}
```

3. 重载插件运行时：

```text
POST /api/plugins/reload
```

4. 查看运行时状态：

```text
GET /api/plugins/runtime
```

5. 使用当前已接入 `modify_loss` 的训练主线进行测试。

注意：截至本文档更新时，`modify_loss` MVP 已经接入 `train_network.py`、`lulynx/newbie/engine.py`、`lulynx/anima_lora_trainer.py` 与 `anima_train.py` 这几条核心主线；其余训练器仍可能尚未覆盖。

6. 查看审计日志：

```text
GET /api/plugins/audit
```

## 生产模式说明

这个示例仓库默认不附带签名信息，所以在普通模式下：

- Tier3 仍然需要本地批准
- Tier3 仍然需要社区信任匹配
- 未满足条件时不会被实际加载

如果你只是想先验证插件调用链路，优先用开发者模式做本地测试会更直接。

## 适合拿它改造成什么

- 轻量 loss 缩放实验
- 训练诊断打点
- 小范围条件 loss 校正

## 不适合拿它做什么

- 直接替换 optimizer 逻辑
- 直接替换 scheduler 逻辑
- 访问网络
- 任意写宿主文件
- 假设自己能接管完整训练流程
