"""
MechaStream — Pydantic schema models.
Matches frontend src/types/schema.ts.
"""

from typing import Any, Dict, List

from pydantic import BaseModel, Field, validator


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPONENT REGISTRY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOWED_COMPONENTS = frozenset({
    "Hero", "Navbar", "Features", "Pricing", "Testimonials",
    "CTA", "Footer", "Dashboard", "Table", "Form",
    "Card", "Modal", "Sidebar", "Stats", "Chart",
})


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# THEME & META
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ThemeConfig(BaseModel):
    primaryColor: str = Field(..., min_length=1, max_length=64)
    fontFamily: str = Field(..., min_length=1, max_length=128)
    borderRadius: str = Field(..., min_length=1, max_length=32)
    spacing: str = Field(..., min_length=1, max_length=32)


class MetaConfig(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    type: str = Field(..., min_length=1, max_length=32)
    theme: ThemeConfig


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION & PAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SectionConfig(BaseModel):
    component: str = Field(..., min_length=1, max_length=32)
    variant: str = Field(default="default", max_length=64)
    props: Dict[str, Any] = Field(default_factory=dict)

    @validator("component")
    def component_must_be_allowed(cls, v: str) -> str:
        if v not in ALLOWED_COMPONENTS:
            allowed = ", ".join(sorted(ALLOWED_COMPONENTS))
            raise ValueError(
                f"component '{v}' is not allowed. Allowed: {allowed}"
            )
        return v


class PageConfig(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    route: str = Field(..., min_length=1, max_length=128)
    sections: List[SectionConfig] = Field(default_factory=list)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# APP SCHEMA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AppSchema(BaseModel):
    meta: MetaConfig
    pages: List[PageConfig] = Field(...)

    @validator("pages")
    def at_least_one_page(cls, v: List[PageConfig]) -> List[PageConfig]:
        if not v:
            raise ValueError("At least one page is required")
        return v
