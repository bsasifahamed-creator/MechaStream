# /backend/config/plans.py
"""
MechaStream — Plan definitions and limits.
PLANS is the single source of truth for all limit checks.
-1 means unlimited.
stripe_price_id loaded from environment variables.
"""

import os

# Stripe price IDs from environment (use test/live keys as appropriate)
STRIPE_PRO_PRICE_ID = os.environ.get("STRIPE_PRO_PRICE_ID")
STRIPE_AGENCY_PRICE_ID = os.environ.get("STRIPE_AGENCY_PRICE_ID")

PLANS = {
    "free": {
        "name": "Free",
        "price_monthly": 0,
        "stripe_price_id": None,
        "limits": {
            "projects": 3,
            "generations_per_month": 10,
            "pages_per_project": 2,
            "exports": 3,
            "deploys": 0,
            "ai_model": "basic",
        },
    },
    "pro": {
        "name": "Pro",
        "price_monthly": 29,
        "stripe_price_id": STRIPE_PRO_PRICE_ID,
        "limits": {
            "projects": 20,
            "generations_per_month": 100,
            "pages_per_project": 10,
            "exports": -1,
            "deploys": 10,
            "ai_model": "standard",
        },
    },
    "agency": {
        "name": "Agency",
        "price_monthly": 79,
        "stripe_price_id": STRIPE_AGENCY_PRICE_ID,
        "limits": {
            "projects": -1,
            "generations_per_month": -1,
            "pages_per_project": -1,
            "exports": -1,
            "deploys": -1,
            "ai_model": "advanced",
        },
    },
}
