# Tech Stack

## 1. Overview

本プロジェクトは、Next.js（App Router）をフロントエンド、FastAPI をバックエンド、Neon を DB として採用したモダン構成の週報アプリである。  
MVP 規模ながらも、本番運用と拡張性を意識した技術選定を行う。

---

## 2. Frontend

### 2.1 Framework

- **Next.js 15（App Router）**
  - Server Components 標準
  - fetch ベースのデータ取得
  - Vercel デプロイとの相性が最適

### 2.2 UI / Styling

- **Tailwind CSS**
- **shadcn/ui**（コンポーネント）
  - ダッシュボード UI、フォーム、ダイアログで利用

### 2.3 Data Fetching / State

- **React Query (@tanstack/react-query)**
  - API キャッシュ管理
  - リトライ制御・通信安定性向上

### 2.4 API 型管理

- **openapi-typescript**（FastAPI → TS 型生成）
  - 型安全な API クライアント生成を支援

### 2.5 Lint / Format

- ESLint
- Prettier
- Tailwind Plugin

---

## 3. Backend

### 3.1 Framework

- **FastAPI**
  - 高速・型安全
  - OpenAPI 自動生成による型連携が容易

### 3.2 Directory Layout

```bash
app/
├── main.py
├── routers/
│   ├── users.py
│   └── reports.py
├── schemas/
│   ├── user.py
│   └── report.py
├── services/
│   └── report_service.py
└── db/
    ├── prisma_client.py
    └── session.py
```

### 3.3 ORM / Migration

- **Prisma for Python**（ORM）
- **Prisma Migrate**（Migration）
  - schema.prisma → migration → DB 反映まで一括で管理

### 3.4 DB Driver

- **psycopg v3**
  - PostgreSQL の標準ドライバ
  - 同期/非同期どちらも利用可能

### 3.5 Environment

- **pydantic-settings** による設定管理
- `.env` に環境変数を保持

### 3.6 Tooling

- Ruff（Lint / Format）

---

## 4. Database

### 4.1 Environment

- **PostgreSQL**

### 4.2 Production

- **Neon**（Serverless Postgres）
  - Branching が容易（開発用 DB 作成が簡単）

### 4.3 Local Development

- Docker Compose 内に PostgreSQL を構築

---

## 5. Infrastructure / DevOps

### 5.1 Container

- **すべて Docker 化**

  - Next.js
  - FastAPI
  - DB

### 5.2 Deployment

- **Vercel**：Next.js
- **Fly.io**：FastAPI
- **Neon**：PostgreSQL

### 5.3 API Spec

- FastAPI 標準の OpenAPI を採用
- publish → openapi-typescript により型生成

---

## 6. Authentication

- **NextAuth.js（Auth.js）**

  - OAuth / Email link などを利用想定
  - 後で導入可能な構成

---

## 7. Scripts（Frontend）

### パッケージ追加

```bash
# React Query
bun add @tanstack/react-query

# 型生成
bun add -d openapi-typescript

# 型安全なfetchクライアント（任意）
bun add openapi-fetch
```

---

## 8. Scripts（Backend）

```bash
# Prisma CLI
pip install prisma

# Migration
prisma migrate dev

# Client生成
prisma generate
```

---

## 9. Quality / Coding Standard

- Backend: Ruff
- Frontend: ESLint + Prettier
- Commit hooks（必要に応じて導入）

---

## 10. Summary

Next.js と FastAPI を中心に、型安全・モダン・メンテナブルな構成に統一した。特に Prisma + openapi-typescript による型の一貫性は、バグ削減と開発効率向上に強く寄与する。今後は認証（NextAuth.js）と CI/CD 構築を追加予定。
