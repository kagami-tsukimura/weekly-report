# デプロイ環境

## 構成

| 層             | サービス | 用途                   |
| -------------- | -------- | ---------------------- |
| フロントエンド | Vercel   | Next.js ホスティング   |
| バックエンド   | Fly.io   | Go/Gin API             |
| データベース   | Neon     | PostgreSQL（RLS 対応） |

---

## 各サービスの選定理由

### Vercel

- Next.js 公式のホスティングサービス
- SSR/SSG の最適化
- 無料枠が広い

### Fly.io

- Docker デプロイ対応
- レガシー無料枠（$5/月）を活用
- スリープなし（デモで即座に動く）
- 既存プロジェクト（MobileNet）で使用経験あり

### Neon

- サーバーレス PostgreSQL
- RLS 対応
- 無料枠：0.5GB ストレージ
- 接続文字列の差し替えだけでローカル PostgreSQL から移行可能

---

## 環境別構成

| 環境     | フロント       | バックエンド   | DB                |
| -------- | -------------- | -------------- | ----------------- |
| ローカル | localhost:3000 | localhost:8080 | Docker PostgreSQL |
| 本番     | Vercel         | Fly.io         | Neon              |

---

## 環境変数

### ローカル（.env.dev）

```go
DATABASE_URL=postgres://dev:dev@localhost:5432/weekly_report?sslmode=disable
```

### 本番（Fly.io secrets）

```bash
fly secrets set DATABASE_URL="postgres://user:pass@ep-xxx.neon.tech/weekly_report?sslmode=require"
```
