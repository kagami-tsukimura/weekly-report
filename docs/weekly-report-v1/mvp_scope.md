# MVP スコープ定義

## 方針

- RLS・テナント・権限管理は後回し
- 認証は簡易化（ユーザー選択式）
- 最短で動くものを作る

## 画面（3 つ）

| 画面          | 内容                                           |
| ------------- | ---------------------------------------------- |
| ユーザー選択  | ドロップダウンでユーザー選択（ログイン代わり） |
| 週報一覧      | 全件表示（全員の週報が見える）                 |
| 週報投稿/編集 | タイトル・本文・対象週を入力                   |

## テーブル（PostgreSQL）

### users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### reports

```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    week_start DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE
    ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## API（6 つ）

### エンドポイント一覧

| Method | Endpoint        | 内容         | リクエストボディ               |
| ------ | --------------- | ------------ | ------------------------------ |
| GET    | `/users`        | ユーザー一覧 | -                              |
| GET    | `/reports`      | 週報一覧     | -                              |
| GET    | `/reports/{id}` | 週報詳細     | -                              |
| POST   | `/reports`      | 週報作成     | `{title, content, week_start}` |
| PUT    | `/reports/{id}` | 週報更新     | `{title, content, week_start}` |
| DELETE | `/reports/{id}` | 週報削除     | -                              |

### データモデル（Pydantic）

```python
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class User(BaseModel):
    id: int
    name: str
    created_at: datetime

class ReportBase(BaseModel):
    title: str
    content: str
    week_start: date

class ReportCreate(ReportBase):
    pass

class ReportUpdate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### API 実装例

```python
from fastapi import FastAPI, HTTPException, Header
from typing import List, Optional

@app.get("/users", response_model=List[User])
def get_users():
    # DB から全ユーザーを取得
    pass

@app.get("/reports", response_model=List[Report])
def get_reports():
    # DB から全週報を取得
    pass

@app.get("/reports/{report_id}", response_model=Report)
def get_report(report_id: int):
    # 特定の週報を取得
    pass

@app.post("/reports", response_model=Report, status_code=201)
def create_report(
    report: ReportCreate,
    x_user_id: int = Header(..., alias="X-User-ID")
):
    # X-User-ID ヘッダーからユーザーを識別して週報作成
    pass

@app.put("/reports/{report_id}", response_model=Report)
def update_report(
    report_id: int,
    report: ReportUpdate,
    x_user_id: int = Header(..., alias="X-User-ID")
):
    # 週報更新（本人確認はMVPでは省略）
    pass

@app.delete("/reports/{report_id}", status_code=204)
def delete_report(
    report_id: int,
    x_user_id: int = Header(..., alias="X-User-ID")
):
    # 週報削除（本人確認はMVPでは省略）
    pass
```

## 認証（簡易）

### 方式

- ヘッダー `X-User-ID` でユーザー ID を渡す
- 本格認証（JWT、OAuth）は後から追加

### FastAPI での実装

```python
from fastapi import Header, HTTPException

def get_current_user_id(x_user_id: int = Header(..., alias="X-User-ID")) -> int:
    """
    リクエストヘッダーから X-User-ID を取得
    MVPでは検証なし、後でJWT等に置き換え
    """
    if x_user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid User ID")
    return x_user_id
```

### フロントエンドからの呼び出し

```typescript
// Next.js での例
const createReport = async (data: ReportData) => {
  const response = await fetch('http://localhost:8000/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': currentUserId.toString(),
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

## バリデーション

### FastAPI（Pydantic）で自動実装

```python
from pydantic import BaseModel, Field, field_validator
from datetime import date

class ReportCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)
    week_start: date

    @field_validator('week_start')
    def validate_week_start(cls, v):
        # 月曜日チェック（オプション）
        if v.weekday() != 0:
            raise ValueError('week_start must be a Monday')
        return v
```

FastAPI は Pydantic を使うため：

- 型チェックが自動
- バリデーションエラーが明確
- OpenAPI ドキュメント（/docs）に自動反映

## エラーハンドリング

### 標準レスポンス形式

```python
from fastapi import HTTPException

# 404 Not Found
raise HTTPException(status_code=404, detail="Report not found")

# 400 Bad Request
raise HTTPException(status_code=400, detail="Invalid input")

# 500 Internal Server Error
raise HTTPException(status_code=500, detail="Database error")
```

### レスポンス例

```json
{
  "detail": "Report not found"
}
```

## 開発の進め方

### ステップ 1：テーブル作成

```bash
# DBeaver で実行
CREATE TABLE users (...);
CREATE TABLE reports (...);
```

### ステップ 2：API 実装（順番）

1. `GET /users` - DB 接続確認
2. `GET /reports` - JOIN クエリ確認
3. `POST /reports` - 作成処理
4. `GET /reports/{id}` - 詳細取得
5. `PUT /reports/{id}` - 更新処理
6. `DELETE /reports/{id}` - 削除処理

### ステップ 3：フロントエンド実装

1. ユーザー選択画面
2. 週報一覧画面
3. 週報投稿/編集画面

### ステップ 4：動作確認

- `/docs` で各 API を手動テスト
- フロントから実際に操作

## FastAPI の利点（MVP 開発）

### 自動ドキュメント生成

- `http://localhost:8000/docs` で Swagger UI
- `http://localhost:8000/redoc` で ReDoc
- API 仕様書が自動生成される

### 型安全性

- Pydantic でリクエスト/レスポンスの型チェック
- エディタの補完が効く
- バグが減る

### 開発速度

- 最小限のコードで動く
- バリデーションが自動
- CORS 設定が簡単

## Next Step

1. テーブル作成（DBeaver）
2. `GET /users` 実装
3. `GET /reports` 実装（JOIN でユーザー名も取得）
4. 残りの CRUD API 実装
5. フロントエンド実装
