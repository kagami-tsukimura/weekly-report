import os
from typing import Annotated, List
from urllib.parse import unquote

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


def get_db(
    x_auth_id: Annotated[str | None, Header()] = None,
    x_user_name: Annotated[str | None, Header()] = None,
):
    """Get DB.
    Args:
        x_auth_id (str | None): User ID from the X-Auth-Id header.
        x_user_name (str | None): User Name from the X-Auth-Id header.
    """
    if not x_auth_id:
        raise HTTPException(status_code=401, detail="X-Auth-ID header required")

    try:
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE auth_id = %s", (x_auth_id,))
            user = cur.fetchone()

            if not user:
                name = unquote(x_user_name) if x_user_name else x_auth_id.split(":")[0]
                cur.execute(
                    "INSERT INTO users (name, auth_id) VALUES (%s, %s)",
                    (name, x_auth_id),
                )
                conn.commit()

            cur.execute(
                "SELECT set_config('app.current_user_id', %s, false)", (x_auth_id,)
            )

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
    """Get all users.
    Args:
        conn (Any): Database connection dependency.
    """
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM users")
            return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports", response_model=List[schemas.Report])
def get_reports(conn=Depends(get_db)):
    """Get all weekly reports.

    Args:
        conn (Any): Database connection dependency.
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
def create_report(
    report: schemas.ReportCreate,
    x_auth_id: Annotated[str | None, Header()] = None,
    conn=Depends(get_db),
):
    """Create a weekly report.

    Args:
        report (schemas.ReportCreate): Report data to create.
        x_auth_id (str | None): User ID from the X-Auth-Id header.
        conn (Any): Database connection dependency.
    Returns:
        schemas.Report: The created report.
    Raises:
        HTTPException: Database error.
    """
    if not x_auth_id:
        raise HTTPException(status_code=401, detail="X-Auth-ID header required")

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE auth_id = %s", (x_auth_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            cur.execute(
                """
                INSERT INTO reports (user_id, week_start, done, todo, issues, learning_hours)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, user_id, week_start, done, todo, issues, learning_hours, created_at, updated_at
                """,
                (
                    user["id"],
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


@app.put("/reports/{report_id}", response_model=schemas.Report)
def update_report(
    report_id: int,
    report: schemas.ReportUpdate,
    x_auth_id: Annotated[str | None, Header()] = None,
    conn=Depends(get_db),
):
    """Update a weekly report.
    Args:
        report_id (int): Report ID to update.
        report (schemas.ReportUpdate): Report data to update.
        x_auth_id (str | None): User ID from the X-Auth-Id header.
        conn (Any): Database connection dependency.
    """
    if not x_auth_id:
        raise HTTPException(status_code=401, detail="X-Auth-ID header required")

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE auth_id= %s", (x_auth_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            cur.execute(
                "SELECT id FROM reports WHERE id = %s AND user_id = %s",
                (report_id, user["id"]),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Report not found")

            update_fields = []
            values = []
            for field, value in report.model_dump(exclude_unset=True).items():
                update_fields.append(f"{field} = %s")
                values.append(value)
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")

            values.append(report_id)
            cur.execute(
                f"""
                UPDATE reports SET {", ".join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, user_id, week_start, done, todo, issues, learning_hours, created_at, updated_at
                """,
                tuple(values),
            )
            result = cur.fetchone()
            conn.commit()
            return result

    except HTTPException as e:
        conn.rollback()
        raise e

    except Exception as e:
        print(f"Error updating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    x_auth_id: Annotated[str | None, Header()] = None,
    conn=Depends(get_db),
):
    """Delete a weekly report.
    Args:
        report_id (int): Report ID to delete.
        x_auth_id (str | None): User ID from the X-Auth-Id header.
        conn (Any): Database connection dependency.
    """
    if not x_auth_id:
        raise HTTPException(status_code=401, detail="X-Auth-ID header required")

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE auth_id = %s", (x_auth_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            cur.execute(
                "DELETE FROM reports WHERE id = %s AND user_id = %s RETURNING id",
                (report_id, user["id"]),
            )
            deleted_report = cur.fetchone()
            if not deleted_report:
                raise HTTPException(status_code=404, detail="Report not found")
            conn.commit()
            return {"message": "Report deleted"}
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error deleting report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
