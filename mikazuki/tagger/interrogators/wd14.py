# from https://github.com/toriato/stable-diffusion-webui-wd14-tagger
import json
import os
import re
from collections import OrderedDict
from glob import glob
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from PIL import Image
from PIL import UnidentifiedImageError
from huggingface_hub import hf_hub_download
from mikazuki.tagger.interrogators.base import Interrogator
from mikazuki.tagger import dbimutils, format


class WaifuDiffusionInterrogator(Interrogator):
    def __init__(
            self,
            name: str,
            model_path='model.onnx',
            tags_path='selected_tags.csv',
            extra_files=None,
            use_rgb=False,
            normalize_01=False,
            **kwargs
    ) -> None:
        super().__init__(name)
        self.model_path = model_path
        self.tags_path = tags_path
        self.extra_files = list(extra_files or [])
        self.use_rgb = use_rgb
        self.normalize_01 = normalize_01
        self.kwargs = kwargs

    def download(self) -> Tuple[os.PathLike, os.PathLike]:
        print(f"Loading {self.name} model file from {self.kwargs['repo_id']}")

        model_path = Path(hf_hub_download(
            **self.kwargs, filename=self.model_path))
        tags_path = Path(hf_hub_download(
            **self.kwargs, filename=self.tags_path))

        for extra_file in self.extra_files:
            hf_hub_download(**self.kwargs, filename=extra_file)

        return model_path, tags_path

    def load(self) -> None:
        model_path, tags_path = self.download()

        # only one of these packages should be installed at a time in any one environment
        # https://onnxruntime.ai/docs/get-started/with-python.html#install-onnx-runtime
        # TODO: remove old package when the environment changes?
        # from mikazuki.launch_utils import is_installed, run_pip
        # if not is_installed('onnxruntime'):
        #     package = os.environ.get(
        #         'ONNXRUNTIME_PACKAGE',
        #         'onnxruntime-gpu'
        #     )

        #     run_pip(f'install {package}', 'onnxruntime')

        # Load torch to load cuda libs built in torch for onnxruntime, do not delete this.
        import torch
        from onnxruntime import InferenceSession

        # https://onnxruntime.ai/docs/execution-providers/
        # https://github.com/toriato/stable-diffusion-webui-wd14-tagger/commit/e4ec460122cf674bbf984df30cdb10b4370c1224#r92654958
        providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']

        self.model = InferenceSession(str(model_path), providers=providers)

        print(f'Loaded {self.name} model from {model_path}')

        self.tags = pd.read_csv(tags_path)

    @staticmethod
    def _to_static_dim(dim) -> int | None:
        if isinstance(dim, (int, np.integer)) and dim > 0:
            return int(dim)
        return None

    def _get_input_layout_and_size(self) -> Tuple[str, int]:
        input_shape = list(self.model.get_inputs()[0].shape)
        if len(input_shape) != 4:
            raise ValueError(
                f"{self.name} expects a 4D ONNX input tensor, but got shape: {input_shape}"
            )

        dims = [self._to_static_dim(dim) for dim in input_shape]

        def is_channel_dim(dim: int | None) -> bool:
            return dim in (1, 3, 4)

        if is_channel_dim(dims[1]) and not is_channel_dim(dims[3]):
            layout = 'NCHW'
            spatial_dims = [dims[2], dims[3]]
        elif is_channel_dim(dims[3]) and not is_channel_dim(dims[1]):
            layout = 'NHWC'
            spatial_dims = [dims[1], dims[2]]
        elif is_channel_dim(dims[1]) and dims[2] == dims[3]:
            layout = 'NCHW'
            spatial_dims = [dims[2], dims[3]]
        elif is_channel_dim(dims[3]) and dims[1] == dims[2]:
            layout = 'NHWC'
            spatial_dims = [dims[1], dims[2]]
        else:
            layout = 'NHWC'
            spatial_dims = [dims[1], dims[2]]

        target_size = next((dim for dim in spatial_dims if dim and dim > 4), None)
        if target_size is None:
            target_size = next((dim for dim in dims[1:] if dim and dim > 4), 448)

        return layout, target_size

    def interrogate(
            self,
            image: Image
    ) -> Dict[str, List[Tuple[str, float]]]:
        # init model
        if not hasattr(self, 'model') or self.model is None:
            self.load()

        # code for converting the image and running the model is taken from the link below
        # thanks, SmilingWolf!
        # https://huggingface.co/spaces/SmilingWolf/wd-v1-4-tags/blob/main/app.py

        # convert an image to fit the model
        layout, target_size = self._get_input_layout_and_size()

        # alpha to white
        image = image.convert('RGBA')
        new_image = Image.new('RGBA', image.size, 'WHITE')
        new_image.paste(image, mask=image)
        image = new_image.convert('RGB')
        image = np.asarray(image)

        # PIL RGB to OpenCV BGR (skip for models that expect RGB input)
        if not self.use_rgb:
            image = image[:, :, ::-1]

        image = dbimutils.make_square(image, target_size)
        image = dbimutils.smart_resize(image, target_size)
        image = image.astype(np.float32)
        if self.normalize_01:
            image = image / 255.0
        if layout == 'NCHW':
            image = image.transpose(2, 0, 1)
        image = np.expand_dims(np.ascontiguousarray(image), 0)

        # evaluate model
        input_name = self.model.get_inputs()[0].name
        label_name = self.model.get_outputs()[0].name
        confidents = self.model.run([label_name], {input_name: image})[0]

        tags = self.tags[:][['name']]
        tags['confidents'] = confidents[0]

        result = {
            "rating": [],
            "general": [],
            "character": [],
            "copyright": [],
            "artist": [],
            "meta": [],
            "species": [],
        }

        # If the CSV has a 'category' column, use it to classify tags
        if 'category' in self.tags.columns:
            cat_col = self.tags['category']
            # Detect if categories are numeric (E621-style: 0,4,5,9) or string (WD14-style: "general","rating",...)
            first_cat = str(cat_col.iloc[0]).strip()
            numeric_cats = first_cat.isdigit()
            for i, row in enumerate(tags.values):
                name, conf = row[0], row[1]
                raw_cat = cat_col.iloc[i]
                if numeric_cats:
                    cat = int(raw_cat)
                    if cat == 9:
                        result["rating"].append((name, conf))
                    elif cat == 4:
                        result["character"].append((name, conf))
                    elif cat == 5:
                        result.setdefault("species", []).append((name, conf))
                    else:
                        result["general"].append((name, conf))
                else:
                    cat_str = str(raw_cat).strip()
                    if cat_str in result:
                        result[cat_str].append((name, conf))
                    else:
                        result["general"].append((name, conf))
        else:
            # Legacy WD14: first 4 items are rating, rest are general
            tag_pairs = list(tags.values)
            for name, conf in tag_pairs[:4]:
                result["rating"].append((name, conf))
            for name, conf in tag_pairs[4:]:
                result["general"].append((name, conf))

        return result
