def setup_plugin(context):
    context.logger.info("modify_loss MVP example loaded")


def on_modify_loss(payload, context):
    mutation = payload.get("mutation")
    if not isinstance(mutation, dict):
        mutation = {}
        payload["mutation"] = mutation

    observed_loss = payload.get("loss")
    mutation["scale"] = 1.02
    mutation["bias"] = 0.0
    mutation["reason"] = "example_affine_boost"
    mutation["metadata"] = {
        "source": "backend-plugin-modify-loss-mvp",
        "observed_loss": observed_loss,
    }

    context.emit_audit(
        event_type="example_modify_loss_applied",
        payload={
            "observed_loss": observed_loss,
            "scale": mutation["scale"],
            "bias": mutation["bias"],
        },
    )
    return payload
