# backend/database.py
import sqlite3
import json
from datetime import datetime
import uuid # To generate unique IDs

DATABASE_FILE = "meetings.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row # Return rows as dict-like objects
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        filename TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        transcript TEXT,
        summary TEXT,
        action_items TEXT  -- Store JSON list as text
    );
    """)
    # Optional: Create index for faster search (consider after performance testing)
    # cursor.execute("CREATE INDEX IF NOT EXISTS idx_transcript ON meetings(transcript);")
    conn.commit()
    conn.close()
    print("Database initialized.")

# Initialize DB when module is loaded
init_db()

def save_meeting(filename: str, transcript: str, summary: str, action_items: list[str]) -> str:
    meeting_id = str(uuid.uuid4()) # Generate a unique ID
    conn = get_db_connection()
    cursor = conn.cursor()
    action_items_json = json.dumps(action_items) # Convert list to JSON string
    try:
        cursor.execute(
            "INSERT INTO meetings (id, filename, transcript, summary, action_items) VALUES (?, ?, ?, ?, ?)",
            (meeting_id, filename, transcript, summary, action_items_json)
        )
        conn.commit()
        return meeting_id
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        conn.rollback() # Rollback changes on error
        raise # Re-raise the exception
    finally:
        conn.close()

def get_meeting(meeting_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM meetings WHERE id = ?", (meeting_id,))
    meeting = cursor.fetchone()
    conn.close()
    if meeting:
         # Convert action_items back to list
         meeting_dict = dict(meeting)
         meeting_dict['action_items'] = json.loads(meeting_dict['action_items'])
         return meeting_dict
    return None


def search_transcripts(query: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Basic keyword search - might need improvement for "topic" search (e.g., using embeddings later)
    search_term = f"%{query}%"
    cursor.execute(
        "SELECT id, filename, timestamp, summary FROM meetings WHERE transcript LIKE ? OR summary LIKE ?",
        (search_term, search_term)
    )
    results = cursor.fetchall()
    conn.close()
    # Convert row objects to dictionaries
    return [dict(row) for row in results]