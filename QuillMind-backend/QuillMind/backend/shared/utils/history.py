from database.db import get_db

def save_history(username, activity_type, title, item_count=0):
    print("SAVE_HISTORY CALLED:", username, activity_type, title)

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO activity_history
            (username, activity_type, title, item_count)
            VALUES (?, ?, ?, ?)
            """,
            (username, activity_type, title, item_count)
        )

    print("HISTORY SAVED")