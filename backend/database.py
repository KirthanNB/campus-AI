"""
Database setup for CampusMind AI using SQLite and SQLAlchemy.
"""

from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'campusmind.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations():
    """Ensures existing SQLite database tables have latest columns."""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if "chat_messages" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("chat_messages")]
        if "session_id" not in columns:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE chat_messages ADD COLUMN session_id VARCHAR(60)"))
                conn.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
