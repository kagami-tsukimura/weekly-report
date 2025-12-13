import os

import psycopg
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
