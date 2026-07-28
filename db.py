import sqlite3

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    
    with open('schema.sql', 'r') as f:
        schema = f.read()
        conn.executescript(schema)
    
    conn.commit()
    conn.close()

def register_user(username, password):
    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            (username, password)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def check_user(username, password):
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        (username, password)
    ).fetchone()
    
    conn.close()
    return user is not None

from src.entities.trip import save_trip, get_user_trips