def setup_plugin(context):
    context.logger.info("Tier1 plugin loaded")


def on_train_complete(payload, context):
    ok = payload.get("ok")
    returncode = payload.get("returncode")
    context.logger.info(f"train complete observed: ok={ok} returncode={returncode}")
    context.emit_audit(
        event_type="plugin_observed_train_complete",
        payload={
            "ok": ok,
            "returncode": returncode,
        },
    )
