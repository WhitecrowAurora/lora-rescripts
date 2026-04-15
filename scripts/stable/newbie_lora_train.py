from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from lulynx.newbie import (
    NewbieCachedTrainer,
    NewbieTrainer,
    build_newbie_model_blueprint,
    cache_missing_newbie_records,
    estimate_newbie_transport_seq_len,
    load_newbie_runtime_config,
)


def _configure_runtime_environment(config) -> None:
    if config.pytorch_cuda_expandable_segments:
        current = str(os.environ.get('PYTORCH_CUDA_ALLOC_CONF', '') or '').strip()
        if 'expandable_segments' not in current.lower():
            os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'
            print(
                '[newbie] enabled PyTorch CUDA expandable_segments for this process: '
                'PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True'
            )


def main() -> None:
    parser = argparse.ArgumentParser(
        description='Prototype Lulynx Newbie trainer shell. This is a new trainer branch and does not reuse the upstream monolithic training script.'
    )
    parser.add_argument('--config_file', required=True, help='Mikazuki TOML config path')
    parser.add_argument(
        '--plan_json',
        default='',
        help='Optional output path for the preparation summary json',
    )
    parser.add_argument(
        '--execute',
        action='store_true',
        help='Execute the requested phase. Without this flag the script only performs planning/inspection.',
    )
    parser.add_argument(
        '--phase',
        choices=['plan', 'cache', 'train', 'full'],
        default='plan',
        help='Which phase to run.',
    )
    parser.add_argument(
        '--device',
        default='cuda',
        help='Execution device for cache phase, for example cuda / cpu.',
    )
    args = parser.parse_args()

    config, warnings = load_newbie_runtime_config(args.config_file)
    _configure_runtime_environment(config)

    trainer = NewbieTrainer(config)
    preparation = trainer.prepare(initial_warnings=warnings)
    blueprint = build_newbie_model_blueprint(
        repo_root=config.repo_root,
        base_model_path=config.pretrained_model_name_or_path,
        mixed_precision=config.mixed_precision,
        trust_remote_code=config.trust_remote_code,
    )
    seq_len = estimate_newbie_transport_seq_len(config.model_resolution)

    for line in trainer.format_preparation_summary(preparation):
        print(line)
    print(f'model_blueprint=class {blueprint.class_name}, cap_feat_dim {blueprint.cap_feat_dim}, in_channels {blueprint.in_channels}')
    print(f'transformer_weight={blueprint.transformer_weight_path}')
    print(f'transport_seq_len={seq_len}')

    plan_json = str(args.plan_json or '').strip()
    if plan_json:
        output_path = Path(plan_json).expanduser().resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_payload = {
            'config': {
                'model_train_type': preparation.config.model_train_type,
                'pretrained_model_name_or_path': preparation.config.pretrained_model_name_or_path.as_posix(),
                'train_data_dir': preparation.config.train_data_dir.as_posix(),
                'output_dir': preparation.config.output_dir.as_posix(),
                'resolution': [
                    preparation.config.resolution_width,
                    preparation.config.resolution_height,
                ],
                'train_batch_size': preparation.config.train_batch_size,
                'gradient_accumulation_steps': preparation.config.gradient_accumulation_steps,
                'use_cache': preparation.config.use_cache,
                'newbie_force_cache_only': preparation.config.newbie_force_cache_only,
                'newbie_two_phase_execution': preparation.config.newbie_two_phase_execution,
                'newbie_gemma_max_token_length': preparation.config.newbie_gemma_max_token_length,
                'newbie_caption_length_bucket_size': preparation.config.newbie_caption_length_bucket_size,
                'lr_scheduler': preparation.config.lr_scheduler,
                'lr_warmup_steps': preparation.config.lr_warmup_steps,
                'max_grad_norm': preparation.config.max_grad_norm,
                'save_every_n_steps': preparation.config.save_every_n_steps,
                'adapter_type': preparation.config.adapter_type,
            },
            'model_blueprint': {
                'class_name': blueprint.class_name,
                'in_channels': blueprint.in_channels,
                'cap_feat_dim': blueprint.cap_feat_dim,
                'clip_text_dim': blueprint.clip_text_dim,
                'clip_img_dim': blueprint.clip_img_dim,
                'dtype': str(blueprint.dtype),
                'transformer_weight_path': blueprint.transformer_weight_path.as_posix(),
                'transport_seq_len': seq_len,
            },
            'dataset': {
                'total_images': preparation.dataset.total_images,
                'total_repeated_images': preparation.dataset.total_repeated_images,
                'missing_caption_count': preparation.dataset.missing_caption_count,
                'complete_cache_count': preparation.dataset.complete_cache_count,
                'missing_cache_count': preparation.dataset.missing_cache_count,
                'max_caption_length': preparation.dataset.max_caption_length,
                'average_caption_length': preparation.dataset.average_caption_length,
                'long_caption_count': preparation.dataset.long_caption_count,
                'cache_complete': preparation.dataset.cache_complete,
                'resolution_buckets': preparation.dataset.resolution_buckets,
                'caption_buckets': preparation.dataset.caption_buckets,
            },
            'phases': [
                {
                    'name': phase.name,
                    'enabled': phase.enabled,
                    'reason': phase.reason,
                    'notes': list(phase.notes),
                }
                for phase in preparation.phases
            ],
            'warnings': list(preparation.warnings),
            'notes': list(preparation.notes),
        }
        output_path.write_text(json.dumps(output_payload, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'[newbie] wrote preparation json: {output_path}')

    if not args.execute or args.phase == 'plan':
        print('[newbie] inspection-only run completed.')
        return

    if args.phase in {'cache', 'full'}:
        print(f'[newbie] running cache phase on device={args.device} ...')
        cache_summary = cache_missing_newbie_records(
            config=config,
            records=preparation.dataset.records,
            device=args.device,
        )
        print(
            '[newbie-cache] '
            f'total={cache_summary.total_records} '
            f'latent_generated={cache_summary.generated_latent_cache} '
            f'text_generated={cache_summary.generated_text_cache} '
            f'skipped={cache_summary.skipped_complete_cache} '
            f'failed={cache_summary.failed_records}'
        )
        for failure in cache_summary.failure_messages[:20]:
            print(f'[newbie-cache][error] {failure}')
        if cache_summary.failed_records > 0 and config.newbie_force_cache_only:
            raise RuntimeError(
                'Newbie cache phase did not complete successfully while force_cache_only is enabled. '
                'Please resolve the cache errors above before entering the train phase.'
            )
        if args.phase == 'cache':
            return

    if args.phase in {'train', 'full'}:
        print('[newbie] running train phase ...')
        result = NewbieCachedTrainer(config).train()
        print(
            '[newbie-train] '
            f'global_step={result.global_step} '
            f'completed_epochs={result.completed_epochs} '
            f'last_loss={result.last_loss:.6f} '
            f'trainable_params={result.trainable_params} '
            f'total_params={result.total_params} '
            f'saved_adapter={result.saved_adapter_path}'
        )
        return

    raise ValueError(f'Unsupported phase: {args.phase}')


if __name__ == '__main__':
    main()

