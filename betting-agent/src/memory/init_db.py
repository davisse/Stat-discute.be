"""Initialize SQLite memory database"""
import sqlite3
from pathlib import Path


def get_db_path() -> Path:
    """Get path to memory database"""
    return Path(__file__).parent.parent.parent / "data" / "agent_memory.db"


def init_database(db_path: Path | None = None) -> sqlite3.Connection:
    """
    Initialize the SQLite database with schema.

    Creates tables if they don't exist.
    Returns connection for immediate use.
    """
    if db_path is None:
        db_path = get_db_path()

    # Ensure data directory exists
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # Connect (creates file if doesn't exist)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row  # Enable dict-like row access

    # Read and execute schema
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, "r") as f:
        schema = f.read()

    conn.executescript(schema)
    conn.commit()

    return conn


def get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    """Get database connection, initializing if needed"""
    if db_path is None:
        db_path = get_db_path()

    if not db_path.exists():
        return init_database(db_path)

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


if __name__ == "__main__":
    # Initialize database when run directly
    db_path = get_db_path()
    print(f"Initializing database at: {db_path}")

    conn = init_database(db_path)

    # Verify tables created
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    tables = [row[0] for row in cursor.fetchall()]

    print(f"Created {len(tables)} tables:")
    for table in tables:
        print(f"  - {table}")

    conn.close()
    print("Database initialized successfully!")
