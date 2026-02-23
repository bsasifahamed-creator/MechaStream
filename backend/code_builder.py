# /backend/code_builder.py

from typing import Dict, Any

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# THEME RESOLVER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RADIUS_MAP = {
    "sharp": "rounded-none",
    "rounded": "rounded-lg",
    "pill": "rounded-full"
}

SPACING_MAP = {
    "compact": "py-6 px-4",
    "normal": "py-12 px-8",
    "relaxed": "py-20 px-12"
}

FONT_MAP = {
    "inter": "font-sans",
    "poppins": "font-poppins",
    "roboto": "font-roboto",
    "manrope": "font-manrope"
}

def resolve_theme(theme: Dict) -> Dict:
    return {
        "color": theme.get("primaryColor", "#6366f1"),
        "radius": RADIUS_MAP.get(theme.get("borderRadius", "rounded"), "rounded-lg"),
        "spacing": SPACING_MAP.get(theme.get("spacing", "normal"), "py-12 px-8"),
        "font": FONT_MAP.get(theme.get("fontFamily", "inter"), "font-sans"),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPONENT TEMPLATES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_navbar(props: Dict, theme: Dict) -> str:
    logo = props.get("logo", "Brand")
    links = props.get("links", ["Home", "Features", "Pricing"])
    links_jsx = " ".join([
        f'<a href="#" className="hover:text-white transition-colors">{link}</a>'
        for link in links
    ])
    return f"""
const Navbar = () => (
  <nav className="w-full flex items-center justify-between px-8 py-4 bg-gray-900 text-gray-300">
    <div className="text-xl font-bold text-white">{logo}</div>
    <div className="flex gap-6 text-sm">
      {links_jsx}
    </div>
    <button className="{theme['radius']} bg-[{theme['color']}] text-white px-4 py-2 text-sm hover:opacity-90 transition">
      Get Started
    </button>
  </nav>
);"""


def build_hero(props: Dict, theme: Dict) -> str:
    headline = props.get("headline", "Build Something Great")
    subheadline = props.get("subheadline", "The platform that helps you ship faster.")
    cta_text = props.get("ctaText", "Get Started")
    cta_link = props.get("ctaLink", "/signup")
    return f"""
const Hero = () => (
  <section className="w-full flex flex-col items-center justify-center text-center {theme['spacing']} bg-gray-950 text-white">
    <h1 className="text-5xl font-bold max-w-3xl leading-tight mb-4">
      {headline}
    </h1>
    <p className="text-gray-400 text-lg max-w-xl mb-8">
      {subheadline}
    </p>
    <a href="{cta_link}"
       className="{theme['radius']} bg-[{theme['color']}] text-white px-8 py-3 text-base font-medium hover:opacity-90 transition">
      {cta_text}
    </a>
  </section>
);"""


def build_features(props: Dict, theme: Dict) -> str:
    title = props.get("title", "Why Choose Us")
    items = props.get("items", [
        {"icon": "⚡", "title": "Fast", "desc": "Built for speed and performance."},
        {"icon": "🔒", "title": "Secure", "desc": "Enterprise-grade security built in."},
        {"icon": "🎯", "title": "Simple", "desc": "Easy to use, powerful to scale."}
    ])
    cards = ""
    for item in items:
        cards += f"""
      <div className="flex flex-col gap-3 p-6 bg-gray-800 {theme['radius']}">
        <div className="text-3xl">{item.get('icon', '✦')}</div>
        <h3 className="text-white font-semibold text-lg">{item.get('title', '')}</h3>
        <p className="text-gray-400 text-sm">{item.get('desc', '')}</p>
      </div>"""
    return f"""
const Features = () => (
  <section className="w-full {theme['spacing']} bg-gray-900">
    <h2 className="text-3xl font-bold text-white text-center mb-10">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {cards}
    </div>
  </section>
);"""


def build_pricing(props: Dict, theme: Dict) -> str:
    title = props.get("title", "Simple Pricing")
    plans = props.get("plans", [
        {"name": "Starter", "price": "$9", "features": ["5 Projects", "Basic Support"]},
        {"name": "Pro", "price": "$29", "features": ["Unlimited Projects", "Priority Support", "Analytics"]},
    ])
    cards = ""
    for plan in plans:
        features_jsx = "".join([
            f'<li className="text-gray-400 text-sm">✓ {f}</li>'
            for f in plan.get("features", [])
        ])
        cards += f"""
      <div className="flex flex-col gap-4 p-8 bg-gray-800 {theme['radius']} border border-gray-700">
        <h3 className="text-white font-bold text-xl">{plan.get('name', '')}</h3>
        <div className="text-4xl font-bold text-[{theme['color']}]">{plan.get('price', '')}</div>
        <ul className="flex flex-col gap-2 mt-2">{features_jsx}</ul>
        <button className="{theme['radius']} mt-4 bg-[{theme['color']}] text-white py-2 hover:opacity-90 transition">
          Get Started
        </button>
      </div>"""
    return f"""
const Pricing = () => (
  <section className="w-full {theme['spacing']} bg-gray-950">
    <h2 className="text-3xl font-bold text-white text-center mb-10">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {cards}
    </div>
  </section>
);"""


def build_cta(props: Dict, theme: Dict) -> str:
    headline = props.get("headline", "Ready to get started?")
    subtext = props.get("subtext", "Join thousands of builders shipping faster.")
    cta_text = props.get("ctaText", "Start Free")
    return f"""
const CTA = () => (
  <section className="w-full {theme['spacing']} bg-[{theme['color']}] text-white text-center">
    <h2 className="text-4xl font-bold mb-4">{headline}</h2>
    <p className="text-white/80 mb-8 text-lg">{subtext}</p>
    <button className="{theme['radius']} bg-white text-[{theme['color']}] px-8 py-3 font-semibold hover:opacity-90 transition">
      {cta_text}
    </button>
  </section>
);"""


def build_footer(props: Dict, theme: Dict) -> str:
    brand = props.get("brand", "Brand")
    tagline = props.get("tagline", "Built with MechaStream.")
    return f"""
const Footer = () => (
  <footer className="w-full px-8 py-6 bg-gray-900 text-gray-500 text-sm flex justify-between items-center">
    <div className="font-semibold text-white">{brand}</div>
    <div>{tagline}</div>
    <div>© 2025 All rights reserved.</div>
  </footer>
);"""


def build_stats(props: Dict, theme: Dict) -> str:
    title = props.get("title", "Numbers That Matter")
    items = props.get("items", [
        {"label": "Users", "value": "10K+"},
        {"label": "Projects", "value": "50K+"},
        {"label": "Uptime", "value": "99.9%"}
    ])
    stats_jsx = "".join([
        f"""
      <div className="flex flex-col items-center gap-2">
        <div className="text-4xl font-bold text-[{theme['color']}]">{item.get('value', '')}</div>
        <div className="text-gray-400 text-sm">{item.get('label', '')}</div>
      </div>"""
        for item in items
    ])
    return f"""
const Stats = () => (
  <section className="w-full {theme['spacing']} bg-gray-900">
    <h2 className="text-3xl font-bold text-white text-center mb-10">{title}</h2>
    <div className="flex flex-wrap justify-center gap-16">
      {stats_jsx}
    </div>
  </section>
);"""


def build_testimonials(props: Dict, theme: Dict) -> str:
    title = props.get("title", "What People Say")
    items = props.get("items", [
        {"name": "Sarah K.", "role": "Developer", "quote": "This saved us weeks of work."},
        {"name": "James R.", "role": "Founder", "quote": "The best tool I've used this year."}
    ])
    cards = "".join([
        f"""
      <div className="p-6 bg-gray-800 {theme['radius']} flex flex-col gap-4">
        <p className="text-gray-300 italic">\"{item.get('quote', '')}\"</p>
        <div>
          <div className="text-white font-semibold">{item.get('name', '')}</div>
          <div className="text-gray-500 text-sm">{item.get('role', '')}</div>
        </div>
      </div>"""
        for item in items
    ])
    return f"""
const Testimonials = () => (
  <section className="w-full {theme['spacing']} bg-gray-950">
    <h2 className="text-3xl font-bold text-white text-center mb-10">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {cards}
    </div>
  </section>
);"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPONENT REGISTRY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT_BUILDERS = {
    "Navbar":       build_navbar,
    "Hero":         build_hero,
    "Features":     build_features,
    "Pricing":      build_pricing,
    "CTA":          build_cta,
    "Footer":       build_footer,
    "Stats":        build_stats,
    "Testimonials": build_testimonials,
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN BUILD FUNCTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_app(schema: Dict) -> Dict:
    """
    Takes validated AppSchema dict.
    Returns generated React code for each page.
    """
    theme = resolve_theme(schema["meta"]["theme"])
    app_title = schema["meta"]["title"]
    pages_output = {}

    for page in schema["pages"]:
        page_name = page["name"]
        route = page["route"]
        component_definitions = []
        component_names = []

        for section in page["sections"]:
            component = section["component"]
            props = section.get("props", {})

            builder = COMPONENT_BUILDERS.get(component)
            if not builder:
                continue  # skip unknown components silently

            component_definitions.append(builder(props, theme))
            component_names.append(component)

        # Assemble page
        components_render = "\n      ".join([
            f"<{name} />" for name in component_names
        ])

        page_code = f"""
import React from 'react';

{chr(10).join(component_definitions)}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGE: {page_name}
// Route: {route}
// Generated by MechaStream
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function {page_name.replace(" ", "")}Page() {{
  return (
    <main className="{theme['font']} min-h-screen bg-gray-950">
      {components_render}
    </main>
  );
}}
"""
        pages_output[route] = {
            "name": page_name,
            "route": route,
            "code": page_code.strip()
        }

    return {
        "success": True,
        "title": app_title,
        "theme": theme,
        "pages": pages_output
    }
