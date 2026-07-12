# check_db.py

import sqlite3
from config.settings import DB_PATH

print("DB PATH:", DB_PATH)

conn = sqlite3.connect(DB_PATH)

tables = conn.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
).fetchall()

print("\nTABLES:")
for t in tables:
    print("-", t[0])

conn.close()