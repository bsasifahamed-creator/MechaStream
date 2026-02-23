# /backend/database/db.py
"""
MechaStream — PostgreSQL connection and query helpers.
Credentials from env: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
"""

import os
from contextlib import contextmanager
from typing import Any, List, Optional, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor

# Thread-local connection for use inside get_db() context
_current_conn = None


def _get_config() -> dict:
    return {
        "host": os.environ.get("DB_HOST", "localhost"),
        "port": int(os.environ.get("DB_PORT", "5432")),
        "dbname": os.environ.get("DB_NAME", "mechastream"),
        "user": os.environ.get("DB_USER", "postgres"),
        "password": os.environ.get("DB_PASSWORD", ""),
    }


@contextmanager
def get_db():
    """
    Context manager for a DB connection.
    Use execute_query, fetch_one, fetch_all inside this block (they use the same connection).
    """
    global _current_conn
    config = _get_config()
    conn = psycopg2.connect(**config)
    conn.autocommit = False
    try:
        _current_conn = conn
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _current_conn = None
        conn.close()


def _conn() -> "psycopg2.extensions.connection":
    if _current_conn is None:
        raise RuntimeError("Not inside a get_db() context. Use: with get_db(): ...")
    return _current_conn


def execute_query(sql: str, params: Optional[Tuple[Any, ...]] = None) -> None:
    """Execute a query (INSERT/UPDATE/DELETE). Use inside get_db() context."""
    with _conn().cursor() as cur:
        cur.execute(sql, params or ())


def fetch_one(sql: str, params: Optional[Tuple[Any, ...]] = None) -> Optional[dict]:
    """Fetch one row as dict. Use inside get_db() context."""
    with _conn().cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params or ())
        return cur.fetchone()


def fetch_all(sql: str, params: Optional[Tuple[Any, ...]] = None) -> List[dict]:
    """Fetch all rows as list of dicts. Use inside get_db() context."""
    with _conn().cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params or ())
        return cur.fetchall()
