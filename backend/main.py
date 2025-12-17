import os
from typing import List

import psycopg
import schemas
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
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


def get_db_connection():
    """DB接続を取得する"""
    try:
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        return conn
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        raise e


@app.get("/")
def read_root():
    return {"message": "Weekly Report"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/users")
def get_users():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, name FROM users")
                users = cur.fetchall()
                return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports", response_model=List[schemas.Report])
def get_reports():
    """Get all weekly reports.

    Returns:
        List[schemas.Report]: All reports.
    Raises:
        HTTPException: Database error.
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, user_id, week_start, done, todo, issues, learning_hours, created_at, updated_at 
                    FROM reports
                    ORDER BY week_start DESC
                    """
                )
                reports = cur.fetchall()

                return reports
    except Exception as e:
        print(f"Error getting report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reports", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate):
    """Create a weekly report.

    Args:
        report (schemas.ReportCreate): Report data to create.
    Returns:
        schemas.Report: The created report.
    Raises:
        HTTPException: Database error.
    """

    try:
        with get_db_connection() as conn:
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
                new_report = cur.fetchone()

                return new_report
    except Exception as e:
        print(f"Error creating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
