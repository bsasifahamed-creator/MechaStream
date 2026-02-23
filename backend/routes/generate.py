# /backend/routes/generate.py

import os
import json
import urllib.request
import urllib.error

from flask import Blueprint, request, jsonify

from schema_validator import validate_schema, detect_complexity
from schema_generator_prompt import SCHEMA_GENERATOR_SYSTEM_PROMPT
from code_builder import build_app

bp = Blueprint("generate", __name__, url_prefix="/api")

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_CODE_MODEL", os.environ.get("OLLAMA_MODEL", "qwen2.5-coder:7b"))
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", 60))


def call_ollama_for_schema(user_prompt: str) -> str:
    """
    Call Ollama with schema-generator system prompt.
    Returns raw string response (expected to be JSON).
    """
    url = f"{OLLAMA_BASE_URL}/api/chat"
    body = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SCHEMA_GENERATOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 1200},
    }
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
            out = json.loads(resp.read().decode())
            return (out.get("message") or {}).get("content") or out.get("response") or ""
    except urllib.error.URLError as e:
        raise RuntimeError(f"Ollama request failed: {e.reason}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Ollama returned invalid JSON: {e}")


@bp.route("/generate", methods=["POST"])
def generate():
    """Schema-only generate: prompt → Ollama → validate_schema → return schema or errors."""
    if not request.is_json:
        return jsonify({"success": False, "errors": ["Content-Type must be application/json"]}), 400

    data = request.get_json() or {}
    user_prompt = (data.get("prompt") or "").strip()

    if not user_prompt:
        return jsonify({
            "success": False,
            "errors": ["Missing or empty prompt"],
            "message": "Please provide a prompt describing the app you want.",
        }), 400

    # Step 1: Complexity check
    complexity = detect_complexity(user_prompt)
    warning = complexity["message"] if complexity["is_complex"] else None

    # Step 2: Call Ollama for schema-only output
    try:
        raw_output = call_ollama_for_schema(user_prompt)
    except RuntimeError as e:
        return jsonify({
            "success": False,
            "errors": [str(e)],
            "message": "Could not get response from Ollama. Is it running? (ollama serve)",
        }), 503

    if not raw_output or not raw_output.strip():
        return jsonify({
            "success": False,
            "errors": ["Ollama returned an empty response"],
            "message": "AI returned no content. Try a clearer or shorter prompt.",
        }), 422

    # Step 3: Validate schema
    result = validate_schema(raw_output)

    if not result["success"]:
        return jsonify({
            "success": False,
            "errors": result["errors"],
            "message": "AI returned an invalid schema. Try simplifying your prompt.",
        }), 422

    # Step 4: Build code from validated schema
    schema = result["schema"]
    built = build_app(schema)

    # Step 5: Return schema + generated pages
    return jsonify({
        "success": True,
        "schema": schema,
        "pages": built["pages"],
        "title": built["title"],
        "theme": built["theme"],
        "warning": warning,
    })
