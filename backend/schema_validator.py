# /backend/schema_validator.py

from pydantic import BaseModel, validator, ValidationError
from typing import List, Dict, Any
import json

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ALLOWED VALUES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOWED_COMPONENTS = {
    "Hero", "Navbar", "Features", "Pricing", "Testimonials",
    "CTA", "Footer", "Dashboard", "Table", "Form",
    "Card", "Modal", "Sidebar", "Stats", "Chart"
}

ALLOWED_PAGE_TYPES = {"landing", "dashboard", "portfolio", "saas"}
ALLOWED_FONTS = {"inter", "poppins", "roboto", "manrope"}
ALLOWED_RADIUS = {"sharp", "rounded", "pill"}
ALLOWED_SPACING = {"compact", "normal", "relaxed"}

MAX_SECTIONS_PER_PAGE = 6
MAX_PAGES = 5

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PYDANTIC MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ThemeModel(BaseModel):
    primaryColor: str
    fontFamily: str
    borderRadius: str
    spacing: str

    @validator("primaryColor")
    def validate_color(cls, v):
        if not v.startswith("#") or len(v) not in [4, 7]:
            raise ValueError(f"Invalid hex color: {v}. Use format #FFF or #FFFFFF")
        return v

    @validator("fontFamily")
    def validate_font(cls, v):
        v_lower = v.lower()
        if v_lower not in ALLOWED_FONTS:
            raise ValueError(f"Font '{v}' not allowed. Use: {ALLOWED_FONTS}")
        return v_lower

    @validator("borderRadius")
    def validate_radius(cls, v):
        if v not in ALLOWED_RADIUS:
            raise ValueError(f"borderRadius '{v}' not allowed. Use: {ALLOWED_RADIUS}")
        return v

    @validator("spacing")
    def validate_spacing(cls, v):
        if v not in ALLOWED_SPACING:
            raise ValueError(f"spacing '{v}' not allowed. Use: {ALLOWED_SPACING}")
        return v


class MetaModel(BaseModel):
    title: str
    type: str
    theme: ThemeModel

    @validator("type")
    def validate_type(cls, v):
        if v not in ALLOWED_PAGE_TYPES:
            raise ValueError(f"Page type '{v}' not allowed. Use: {ALLOWED_PAGE_TYPES}")
        return v

    @validator("title")
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Title cannot be empty")
        return v.strip()


class SectionModel(BaseModel):
    component: str
    variant: str
    props: Dict[str, Any]

    @validator("component")
    def validate_component(cls, v):
        if v not in ALLOWED_COMPONENTS:
            raise ValueError(
                f"Component '{v}' is not in registry. "
                f"Allowed: {sorted(ALLOWED_COMPONENTS)}"
            )
        return v

    @validator("props")
    def validate_props(cls, v):
        if not isinstance(v, dict):
            raise ValueError("Props must be a dictionary")
        return v


class PageModel(BaseModel):
    name: str
    route: str
    sections: List[SectionModel]

    @validator("sections")
    def validate_sections_count(cls, v):
        if len(v) > MAX_SECTIONS_PER_PAGE:
            raise ValueError(
                f"Too many sections ({len(v)}). Max allowed: {MAX_SECTIONS_PER_PAGE}"
            )
        if len(v) == 0:
            raise ValueError("Page must have at least 1 section")
        return v

    @validator("route")
    def validate_route(cls, v):
        if not v.startswith("/"):
            raise ValueError(f"Route must start with '/'. Got: {v}")
        return v


class AppSchema(BaseModel):
    meta: MetaModel
    pages: List[PageModel]

    @validator("pages")
    def validate_pages_count(cls, v):
        if len(v) > MAX_PAGES:
            raise ValueError(f"Too many pages ({len(v)}). Max allowed: {MAX_PAGES}")
        if len(v) == 0:
            raise ValueError("App must have at least 1 page")
        return v


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN VALIDATOR FUNCTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def validate_schema(raw_output: str) -> dict:
    """
    Takes raw string output from Ollama.
    Returns dict with:
      - success: bool
      - schema: validated dict (if valid)
      - errors: list of error messages (if invalid)
    """
    # Step 1: Strip any accidental markdown
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    # Step 2: Parse JSON
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "schema": None,
            "errors": [f"Invalid JSON from AI: {str(e)}"],
            "raw": raw_output
        }

    # Step 3: Validate against schema
    try:
        validated = AppSchema(**data)
        return {
            "success": True,
            "schema": validated.dict(),
            "errors": []
        }
    except ValidationError as e:
        errors = []
        for error in e.errors():
            location = " → ".join(str(loc) for loc in error["loc"])
            errors.append(f"{location}: {error['msg']}")
        return {
            "success": False,
            "schema": None,
            "errors": errors,
            "raw": raw_output
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLEXITY DETECTOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLEXITY_TRIGGERS = [
    "animation", "3d", "parallax", "infinite scroll",
    "real-time", "realtime", "websocket", "custom css",
    "fully custom", "advanced", "complex", "dynamic chart",
    "video background", "particle", "canvas"
]

def detect_complexity(prompt: str) -> dict:
    """
    Checks user prompt for complexity triggers.
    Returns warning if prompt is too complex for V1.
    """
    prompt_lower = prompt.lower()
    triggered = [t for t in COMPLEXITY_TRIGGERS if t in prompt_lower]

    if triggered:
        return {
            "is_complex": True,
            "triggers": triggered,
            "message": (
                f"Your prompt contains features that exceed V1 generation scope: "
                f"{', '.join(triggered)}. "
                f"MechaStream will generate a simplified scaffold instead. "
                f"You can refine manually in the editor."
            )
        }
    return {"is_complex": False, "triggers": [], "message": ""}
