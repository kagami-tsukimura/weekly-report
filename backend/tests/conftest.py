import os
import sys

import psycopg
import pytest
from httpx import ASGITransport, AsyncClient
from psycopg.rows import dict_row

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import main  # noqa
from main import app  # noqa

if main.DATABASE_URL and "@db:" in main.DATABASE_URL:
    main.DATABASE_URL = main.DATABASE_URL.replace("@db:", "@localhost:")

DATABASE_URL = os.getenv("DATABASE_URL")


@pytest.fixture(scope="function")
def db_connection():
    """テスト用のDB接続を提供し、テスト後にデータをクリーンアップする"""
    # テスト用のDB接続は管理者(dev)で行い、RLSを無視してクリーンアップできるようにする
    url = DATABASE_URL
    if url:
        # app_user -> dev に置換 (パスワードも dev)
        url = url.replace("app_user:app_password", "dev:dev")

    try:
        conn = psycopg.connect(url, row_factory=dict_row)
    except psycopg.OperationalError:
        # ローカル実行時など、ホスト名 'db' が解決できない場合は 'localhost' で試行
        if url and "@db:" in url:
            url = url.replace("@db:", "@localhost:")
            conn = psycopg.connect(url, row_factory=dict_row)
        else:
            raise

    try:
        yield conn
    finally:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM reports")
            cur.execute("DELETE FROM users")
        conn.commit()
        conn.close()


@pytest.fixture
async def async_client():
    """非同期HTTPクライアント"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
