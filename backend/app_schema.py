"""
MechaStream — Schema-first app definition (Pydantic v1).
Must stay in sync with frontend src/types/app-schema.ts.
Used for: Prompt → JSON Schema → Deterministic Code Builder.
"""

from enum import Enum
from typing import Any, Dict, List

from pydantic import BaseModel, Field, validator


# ─── Controlled component registry (AI cannot invent components outside this list) ───
CONTROLLED_COMPONENT_NAMES = frozenset({
    "Hero", "Navbar", "Features", "Pricing", "Testimonials",
    "CTA", "Footer", "Dashboard", "Table", "Form",
    "Card", "Modal", "Sidebar", "Stats", "Chart",
})


class AppType(str, Enum):
    landing = "landing"
    dashboard = "dashboard"
    portfolio = "portfolio"
    saas = "saas"


class BorderRadius(str, Enum):
    sharp = "sharp"
    rounded = "rounded"
    pill = "pill"


class Spacing(str, Enum):
    compact = "compact"
    normal = "normal"
    relaxed = "relaxed"


class ThemeSchema(BaseModel):
    primaryColor: str = Field(..., min_length=1, max_length=64)
    fontFamily: str = Field(..., min_length=1, max_length=128)
    borderRadius: BorderRadius = BorderRadius.rounded
    spacing: Spacing = Spacing.normal


class MetaSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    type: AppType = AppType.landing
    theme: ThemeSchema


class SectionSchema(BaseModel):
    component: str = Field(..., min_length=1, max_length=32)
    variant: str = Field(default="default", max_length=64)
    props: Dict[str, Any] = Field(default_factory=dict)

    @validator("component")
    def component_must_be_in_registry(cls, v: str) -> str:
        if v not in CONTROLLED_COMPONENT_NAMES:
            allowed = ", ".join(sorted(CONTROLLED_COMPONENT_NAMES))
            raise ValueError(
                f"component '{v}' is not in the controlled registry. "
                f"Allowed: {allowed}"
            )
        return v


class PageSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    route: str = Field(..., min_length=1, max_length=128)
    sections: List[SectionSchema] = Field(default_factory=list)


class AppSchema(BaseModel):
    meta: MetaSchema
    pages: List[PageSchema] = Field(...)

    @validator("pages")
    def at_least_one_page(cls, v: List[PageSchema]) -> List[PageSchema]:
        if not v:
            raise ValueError("At least one page is required")
        return v


def validate_app_schema(data: Dict[str, Any] | str) -> AppSchema:
    """
    Parse and validate JSON against AppSchema.
    Raises pydantic.ValidationError if invalid.
    """
    if isinstance(data, str):
        import json
        data = json.loads(data)
    return AppSchema.parse_obj(data)
