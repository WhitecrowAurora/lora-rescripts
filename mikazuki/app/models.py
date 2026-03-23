from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class TaggerInterrogateRequest(BaseModel):
    path: str = Field(min_length=1)
    interrogator_model: str = Field(
        default="wd14-convnextv2-v2"
    )
    threshold: float = Field(
        default=0.35,
        ge=0,
        le=1
    )
    character_threshold: float = Field(
        default=0.6,
        ge=0,
        le=1
    )
    add_rating_tag: bool = False
    add_model_tag: bool = False
    additional_tags: str = ""
    exclude_tags: str = ""
    escape_tag: bool = True
    batch_input_recursive: bool = False
    batch_output_action_on_conflict: Literal["ignore", "copy", "prepend"] = "ignore"
    create_backup_before_write: bool = False
    backup_snapshot_name: str = ""
    replace_underscore: bool = True
    replace_underscore_excludes: str = Field(
        default="0_0, (o)_(o), +_+, +_-, ._., <o>_<o>, <|>_<|>, =_=, >_<, 3_3, 6_9, >_o, @_@, ^_^, o_o, u_u, x_x, |_|, ||_||"
    )


class DatasetAnalysisRequest(BaseModel):
    path: str = Field(min_length=1)
    caption_extension: str = ".txt"
    top_tags: int = Field(
        default=40,
        ge=1,
        le=200,
    )
    sample_limit: int = Field(
        default=8,
        ge=1,
        le=50,
    )


class MaskedLossAuditRequest(BaseModel):
    path: str = Field(min_length=1)
    recursive: bool = True
    sample_limit: int = Field(
        default=8,
        ge=1,
        le=50,
    )


class CaptionCleanupRequest(BaseModel):
    path: str = Field(min_length=1)
    caption_extension: str = ".txt"
    recursive: bool = True
    collapse_whitespace: bool = True
    replace_underscore: bool = False
    dedupe_tags: bool = True
    sort_tags: bool = False
    remove_tags: str = ""
    prepend_tags: str = ""
    append_tags: str = ""
    search_text: str = ""
    replace_text: str = ""
    use_regex: bool = False
    create_backup_before_apply: bool = False
    backup_snapshot_name: str = ""
    sample_limit: int = Field(
        default=8,
        ge=1,
        le=50,
    )


class CaptionBackupRequest(BaseModel):
    path: str = Field(min_length=1)
    caption_extension: str = ".txt"
    recursive: bool = True
    snapshot_name: str = ""


class CaptionBackupListRequest(BaseModel):
    path: str = ""


class CaptionBackupRestoreRequest(BaseModel):
    path: str = Field(min_length=1)
    archive_name: str = Field(min_length=1)
    make_restore_backup: bool = True


class APIResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class APIResponseSuccess(APIResponse):
    status: str = "success"


class APIResponseFail(APIResponse):
    status: str = "fail"
