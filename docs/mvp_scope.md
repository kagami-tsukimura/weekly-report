# MVP スコープ定義

## 方針

- RLS・テナント・権限管理は後回し
- 認証は簡易化（ユーザー選択式）
- 最短で動くものを作る

---

## 画面（3 つ）

| 画面          | 内容                                           |
| ------------- | ---------------------------------------------- |
| ユーザー選択  | ドロップダウンでユーザー選択（ログイン代わり） |
| 週報一覧      | 全件表示（全員の週報が見える）                 |
| 週報投稿/編集 | タイトル・本文・対象週を入力                   |

---

## テーブル（PostgreSQL）

```sql
users (id, name, created_at)
reports (id, user_id, title, content, week_start, created_at, updated_at)
```

---

## API（6 つ）

| Method | Endpoint       | 内容         |
| ------ | -------------- | ------------ |
| GET    | `/users`       | ユーザー一覧 |
| GET    | `/reports`     | 週報一覧     |
| GET    | `/reports/:id` | 週報詳細     |
| POST   | `/reports`     | 週報作成     |
| PUT    | `/reports/:id` | 週報更新     |
| DELETE | `/reports/:id` | 週報削除     |

---

## 認証（簡易）

- ヘッダー `X-User-ID` でユーザー ID を渡す
- 本格認証（JWT、OAuth）は後から追加
