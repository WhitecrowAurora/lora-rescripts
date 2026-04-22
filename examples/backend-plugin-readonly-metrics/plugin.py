def setup_plugin(context):
    meta = context.to_public_dict()
    context.logger.info(
        f"loaded plugin {meta['plugin_id']} v{meta['version']} with hooks={len(meta['hooks'])}"
    )


def _safe_get(payload, key, default=None):
    if payload is None:
        return default
    getter = getattr(payload, "get", None)
    if callable(getter):
        return getter(key, default)
    return default


def on_app_start(payload, context):
    context.logger.info("application startup observed by readonly plugin")
    context.emit_audit(
        event_type="example_app_start",
        payload={
            "active_ui_profile": _safe_get(payload, "active_ui_profile"),
            "plugin_developer_mode": _safe_get(payload, "plugin_developer_mode"),
        },
    )


def on_config_loaded(payload, context):
    model_train_type = _safe_get(payload, "model_train_type")
    config_key_count = _safe_get(payload, "config_key_count")
    context.logger.info(
        f"config loaded observed: type={model_train_type} keys={config_key_count}"
    )
    context.emit_audit(
        event_type="example_config_loaded",
        payload={
            "model_train_type": model_train_type,
            "config_key_count": config_key_count,
        },
    )


def on_train_launch(payload, context):
    model_train_type = _safe_get(payload, "model_train_type")
    trainer_file = _safe_get(payload, "trainer_file")
    distributed_world_size = _safe_get(payload, "distributed_world_size")
    context.logger.info(
        f"train launch observed: type={model_train_type} trainer={trainer_file} world={distributed_world_size}"
    )
    context.emit_audit(
        event_type="example_train_launch",
        payload={
            "model_train_type": model_train_type,
            "trainer_file": trainer_file,
            "distributed_world_size": distributed_world_size,
        },
    )


def on_train_complete(payload, context):
    ok = _safe_get(payload, "ok")
    returncode = _safe_get(payload, "returncode")
    fatal_error = _safe_get(payload, "fatal_error")
    context.logger.info(f"train complete observed: ok={ok} returncode={returncode}")
    context.emit_audit(
        event_type="example_train_complete",
        payload={
            "ok": ok,
            "returncode": returncode,
            "fatal_error": fatal_error,
        },
    )
