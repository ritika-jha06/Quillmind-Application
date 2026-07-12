import sqlite3
from config.settings import DB_PATH

conn = sqlite3.connect(DB_PATH)

rows = conn.execute(
    "SELECT * FROM activity_history"
).fetchall()

print("TOTAL ROWS:", len(rows))

for row in rows:
    print(row)

conn.close()