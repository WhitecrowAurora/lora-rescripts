from __future__ import annotations

from networks import lora as lora_network


def create_network(
    multiplier,
    network_dim,
    network_alpha,
    vae,
    text_encoder,
    unet,
    neuron_dropout=None,
    **kwargs,
):
    kwargs = dict(kwargs)
    kwargs["adapter_type"] = "vera"
    return lora_network.create_network(
        multiplier,
        network_dim,
        network_alpha,
        vae,
        text_encoder,
        unet,
        neuron_dropout=neuron_dropout,
        **kwargs,
    )


def create_network_from_weights(multiplier, file, vae, text_encoder, unet, weights_sd=None, for_inference=False, **kwargs):
    if not for_inference:
        raise RuntimeError(
            "VeRA exports are saved as inference-compatible standard LoRA weights. "
            "Continuing VeRA training from exported adapter weights is not supported; "
            "please resume from save_state / checkpoint instead."
        )
    return lora_network.create_network_from_weights(
        multiplier,
        file,
        vae,
        text_encoder,
        unet,
        weights_sd=weights_sd,
        for_inference=for_inference,
        **kwargs,
    )
