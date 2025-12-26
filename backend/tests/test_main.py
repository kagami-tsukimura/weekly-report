import pytest
from httpx import AsyncClient

# テストデータ
USER_A_AUTH_ID = "github:111111"
USER_A_NAME = "User A"
USER_B_AUTH_ID = "github:222222"
USER_B_NAME = "User B"


@pytest.mark.asyncio
async def test_create_report_success(async_client: AsyncClient, db_connection):
    """正常系: レポート作成"""
    response = await async_client.post(
        "/reports",
        json={
            "week_start": "2025-01-01",
            "done": "Done item",
            "todo": "Todo item",
            "learning_hours": 5.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID, "X-User-Name": USER_A_NAME},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["done"] == "Done item"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_reports_success(async_client: AsyncClient, db_connection):
    """正常系: 作成したレポートが取得できる"""
    # 1. 作成
    await async_client.post(
        "/reports",
        json={
            "week_start": "2025-01-01",
            "done": "Done item",
            "todo": "Todo item",
            "learning_hours": 5.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID, "X-User-Name": USER_A_NAME},
    )
    # 2. 取得
    response = await async_client.get("/reports", headers={"X-Auth-ID": USER_A_AUTH_ID})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["done"] == "Done item"


@pytest.mark.asyncio
async def test_rls_cannot_see_others_reports(async_client: AsyncClient, db_connection):
    """RLS: 他人のレポートは見えない"""
    # User A が作成
    await async_client.post(
        "/reports",
        json={
            "week_start": "2025-01-01",
            "done": "User A Report",
            "todo": "Todo",
            "learning_hours": 1.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID},
    )
    # User B が取得
    response = await async_client.get("/reports", headers={"X-Auth-ID": USER_B_AUTH_ID})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


@pytest.mark.asyncio
async def test_update_report_success(async_client: AsyncClient, db_connection):
    """正常系: レポート更新"""
    # 作成
    create_res = await async_client.post(
        "/reports",
        json={
            "week_start": "2025-01-01",
            "done": "Original",
            "todo": "Original",
            "learning_hours": 1.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID},
    )
    report_id = create_res.json()["id"]
    # 更新
    update_res = await async_client.put(
        f"/reports/{report_id}",
        json={
            "week_start": "2025-01-01",
            "done": "Updated",
            "todo": "Updated",
            "learning_hours": 2.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID},
    )
    assert update_res.status_code == 200
    assert update_res.json()["done"] == "Updated"


@pytest.mark.asyncio
async def test_delete_report_success(async_client: AsyncClient, db_connection):
    """正常系: レポート削除"""
    # 作成
    create_res = await async_client.post(
        "/reports",
        json={
            "week_start": "2025-01-01",
            "done": "To Delete",
            "todo": "To Delete",
            "learning_hours": 1.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID},
    )
    report_id = create_res.json()["id"]
    # 削除
    delete_res = await async_client.delete(
        f"/reports/{report_id}", headers={"X-Auth-ID": USER_A_AUTH_ID}
    )
    assert delete_res.status_code == 200
    # 削除確認
    update_res = await async_client.put(
        f"/reports/{report_id}",
        json={"done": "Try Update"},
        headers={"X-Auth-ID": USER_A_AUTH_ID},
    )
    assert update_res.status_code == 404


@pytest.mark.asyncio
async def test_rls_cannot_delete_others_report(
    async_client: AsyncClient, db_connection
):
    """RLS: 他人のレポートは削除できない"""
    # User A が作成
    create_res = await async_client.post(
        "/reports",
        json={
            "week_start": "2025-01-01",
            "done": "User A Report",
            "todo": "Todo",
            "learning_hours": 1.0,
        },
        headers={"X-Auth-ID": USER_A_AUTH_ID},
    )
    report_id = create_res.json()["id"]
    # User B が削除試行
    delete_res = await async_client.delete(
        f"/reports/{report_id}", headers={"X-Auth-ID": USER_B_AUTH_ID}
    )
    assert delete_res.status_code == 404
