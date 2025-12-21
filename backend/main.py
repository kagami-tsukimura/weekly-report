import os
from typing import Annotated, List

import psycopg
import schemas
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg.rows import dict_row

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://dev:dev@localhost:5432/weekly_report"
)


def get_db(x_auth_id: Annotated[str | None, Header()] = "user_1_secret"):
    """DB接続を取得する"""
    try:
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        with conn.cursor() as cur:
            cur.execute(f"SET app.current_user_id = '{x_auth_id}'")
        yield conn
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        raise e
    finally:
        conn.close()


@app.get("/")
def read_root():
    return {"message": "Weekly Report"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/users")
def get_users(conn=Depends(get_db)):
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM users")
            return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports", response_model=List[schemas.Report])
def get_reports(conn=Depends(get_db)):
    """Get all weekly reports.

    Returns:
        List[schemas.Report]: All reports.
    Raises:
        HTTPException: Database error.
    """
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, week_start, done, todo, issues, learning_hours, created_at, updated_at
                FROM reports
                ORDER BY week_start DESC
                """
            )
            return cur.fetchall()
    except Exception as e:
        print(f"Error getting report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reports", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate, conn=Depends(get_db)):
    """Create a weekly report.

    Args:
        report (schemas.ReportCreate): Report data to create.
    Returns:
        schemas.Report: The created report.
    Raises:
        HTTPException: Database error.
    """

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reports (user_id, week_start, done, todo, issues, learning_hours)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, user_id, week_start, done, todo, issues, learning_hours, created_at, updated_at
                """,
                (
                    report.user_id,
                    report.week_start,
                    report.done,
                    report.todo,
                    report.issues,
                    report.learning_hours,
                ),
            )
            result = cur.fetchone()
            conn.commit()
            return result

    except Exception as e:
        conn.rollback()
        print(f"Error creating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
