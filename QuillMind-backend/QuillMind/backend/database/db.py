"""
QuillMind — SQLite Database
Creates tables on first run and provides a context-manager connection helper.
"""

import os
import sqlite3
from contextlib import contextmanager

from config.settings import DB_PATH
from shared.utils.logger import logger


def init_db() -> None:
    """Create all required tables if they do not exist yet."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    conn.executescript("""
        CREATE TABLE IF NOT EXISTS admins (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT    UNIQUE NOT NULL,
            password   TEXT    NOT NULL,
            role       TEXT    NOT NULL DEFAULT 'sub_admin',
            created_at TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS reading_sessions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT NOT NULL,
            filename   TEXT NOT NULL,
            page       INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT    DEFAULT (datetime('now')),
            UNIQUE(username, filename)
        );
        
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            institution TEXT DEFAULT '',
            avatar TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
                       
        CREATE TABLE IF NOT EXISTS activity_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            title TEXT NOT NULL,
            item_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at TEXT NOT NULL
        );
                                   
    """)

    # Seed a default super-admin if none exist
    existing = conn.execute("SELECT id FROM admins WHERE role='admin'").fetchone()
    if not existing:
        # Default credentials: admin / quillmind123  (change in production!)
        import hashlib
        pw_hash = hashlib.sha256("quillmind123".encode()).hexdigest()
        conn.execute(
            "INSERT INTO admins (username, password, role) VALUES (?,?,?)",
            ("admin", pw_hash, "admin"),
        )
        conn.commit()
        logger.info("Default admin seeded (username: admin, password: quillmind123).")

    conn.close()
    logger.info("Database initialised at '%s'.", DB_PATH)


@contextmanager
def get_db():
    """Yield a sqlite3 connection with Row factory; auto-commits on success."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
