# 週報アプリ開発：セットアップ手順

## 開発方針

- **アジャイルに進める**：完璧な設計より、動くものを最速で作る
- **困ったときに調べる**：全部決めてから実装しない
- **最小ステップで反復**：1 機能ずつ動作確認しながら進める

## セットアップ順序

```text
1. gitリポジトリ作成
2. Docker-Compose作成→起動（PostgreSQL）
3. DBeaver インストール・DB接続確認
4. FastAPI（バックエンド）
5. Next（フロントエンド）
```

## 1. git リポジトリ作成

```bash
# プロジェクトディレクトリ作成
mkdir weekly-report
cd weekly-report

# Git初期化
git init

# .gitignore作成
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.pyc
.pytest_cache/
.uv/
.venv/
*.egg-info/

# JavaScript
node_modules/
.next/
out/

# 環境変数
.env
.env.local

# その他
*.log
.DS_Store
dist/
build/
.next/
EOF

# 初回コミット
git add .gitignore
git commit -m "chore: initial commit"
```

## 2. Docker-Compose 作成 → 起動

### docker-compose.yml 作成

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    container_name: weekly-report-db
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: weekly_report
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 起動

```bash
# PostgreSQL起動
docker-compose up -d

# 起動確認
docker-compose ps

# ログ確認
docker-compose logs db

# コミット
git add docker-compose.yml
git commit -m "feat: setup PostgreSQL with Docker"
```

## 3. DBeaver インストール・DB 接続確認

### DBeaver インストール

**公式サイト**: <https://dbeaver.io/download/>

**インストール方法**:

- **macOS**: Homebrew 推奨

  ```bash
  brew install --cask dbeaver-community
  ```

- **Windows**: インストーラーをダウンロードして実行

- **Linux**: 各ディストリビューションのパッケージマネージャー

### DB 接続設定

1. DBeaver を起動
1. 「Database」→「New Database Connection」をクリック
1. 「PostgreSQL」を選択
1. 以下の情報を入力：

```text
Host: localhost
Port: 5432
Database: weekly_report
User: dev
Password: dev
```

1. 「Test Connection」で接続確認
1. 必要に応じて PostgreSQL ドライバーのダウンロード（自動）
1. 「Finish」をクリック

### テーブル作成

1. 左サイドバーで `weekly_report` データベースを展開
2. 右クリック → 「SQL Editor」→「New SQL Script」
3. 以下の SQL を実行：

```sql
-- usersテーブル作成
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テストデータ投入
INSERT INTO users (name) VALUES ('Alice'), ('Bob');

-- 確認
SELECT * FROM users;
```

実行方法：

- SQL を選択して `Ctrl+Enter`（Windows/Linux）または `Cmd+Enter`（macOS）
- または、実行ボタン（▶️）をクリック

### DBeaver の便利機能

- **ER 図表示**: データベースを右クリック → 「View Diagram」
- **データ編集**: テーブルをダブルクリックして直接編集
- **クエリ履歴**: 過去に実行したクエリを再利用
- **エクスポート**: データを CSV/JSON 等で出力

## 4. FastAPI（バックエンド）

### uv インストール

**公式サイト**: <https://docs.astral.sh/uv/>

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh

# インストール確認
uv --version
```

### プロジェクト作成

```bash
# バックエンドディレクトリ作成・移動
mkdir backend
cd backend

# uv でプロジェクト初期化
uv init

# 依存パッケージ追加
uv add fastapi uvicorn psycopg2-binary python-dotenv

# Ruff（lint + format）追加
uv add --dev ruff
```

### pyproject.toml（自動生成）

```toml
[project]
name = "weekly-report-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi",
    "uvicorn",
    "psycopg2-binary",
    "python-dotenv",
]

[tool.uv]
dev-dependencies = [
    "ruff",
]

[tool.ruff]
line-length = 100
target-version = "py312"
```

### main.py 作成（最小構成）

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import os

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB接続設定
DATABASE_URL = "postgresql://dev:dev@localhost:5432/weekly_report"

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

@app.get("/")
def read_root():
    return {"message": "Weekly Report API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/users")
def get_users():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT id, name FROM users")
                users = cursor.fetchall()
                return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Ruff 設定・実行

```bash
# コード整形
uv run ruff format .

# Lint実行
uv run ruff check .

# 自動修正
uv run ruff check --fix .
```

### 起動確認

```bash
# サーバー起動
uv run uvicorn main:app --reload

# 別ターミナルで確認
curl http://localhost:8000/health
curl http://localhost:8000/users

# ブラウザで確認（自動生成されたAPIドキュメント）
# http://localhost:8000/docs
```

### .env 作成（オプション）

```bash
# backend/.env
DATABASE_URL=postgresql://dev:dev@localhost:5432/weekly_report
```

main.py で使用：

```python
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
```

### バックエンドコミット

```bash
cd ..  # プロジェクトルートに戻る
git add backend/
git commit -m "feat: add FastAPI backend"
```

## 5. Next（フロントエンド）with Bun

### Bun インストール

**公式サイト**: <https://bun.sh>

```bash
curl -fsSL https://bun.sh/install | bash

# インストール確認
bun --version
```

### Next.js 作成

```bash
# フロントエンドディレクトリ作成
mkdir frontend
cd frontend

# Next.js 初期化
bun create next-app . --typescript --tailwind --app --no-src-dir

# 依存パッケージインストール済み
```

### API テスト用ページ作成

#### app/page.tsx

```typescript
'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  name: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>ユーザー一覧</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </main>
  );
}
```

### フロントエンド起動確認

```bash
bun dev

# → http://localhost:3000 にアクセス
```

### パッケージ追加（例）

```bash
# React Query（データフェッチ・キャッシュ）
bun add @tanstack/react-query

# OpenAPI → TypeScript 型生成
bun add -d openapi-typescript

# 開発用パッケージ
bun add -d @types/node
```

### フロントエンドコミット

```bash
cd ..  # プロジェクトルートに戻る
git add frontend/
git commit -m "feat: add Next.js frontend"
```

## 最初の 30 分でやること

```bash
# 1. リポジトリ作成（5分）
mkdir weekly-report && cd weekly-report
git init
# .gitignore作成

# 2. PostgreSQL起動（5分）
# docker-compose.yml作成
docker-compose up -d

# 3. 接続確認（5分）
# DBeaver起動 → PostgreSQLに接続
# usersテーブル作成

# 4. FastAPI実装（10分）
cd backend
uv init
uv add fastapi uvicorn psycopg2-binary
# main.py作成
uv run uvicorn main:app --reload

# 5. Next実装（5分）
cd ../frontend
bun create next-app .
# app/page.tsx編集
bun dev
```

## ディレクトリ構成

```text
weekly-report/
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── .venv/              # uv が自動管理
│   ├── pyproject.toml      # uv の設定ファイル
│   ├── uv.lock             # 依存関係のロックファイル
│   └── main.py
└── frontend/
    ├── package.json
    ├── bun.lockb           # Bun のロックファイル
    ├── next.config.js
    └── app/
        └── page.tsx
```

## トラブルシューティング

### PostgreSQL に接続できない

```bash
# コンテナ起動確認
docker-compose ps

# ログ確認
docker-compose logs db

# 再起動
docker-compose restart db
```

### DBeaver で接続できない

1. PostgreSQL コンテナが起動しているか確認

   ```bash
   docker-compose ps
   ```

2. 接続情報が正しいか確認（特にポート番号）
3. PostgreSQL ドライバーが正しくインストールされているか確認
4. DBeaver を再起動

### FastAPI でエラー

```bash
# uv の同期確認
uv sync

# 依存パッケージ再インストール
uv pip install -r pyproject.toml

# ポート確認（8000が使用中の場合）
uv run uvicorn main:app --reload --port 8001
```

### psycopg2 インストールエラー

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install libpq-dev

# Windows
# psycopg2-binaryを使用（既に指定済み）
```

### Bun でエラー

```bash
# キャッシュクリア
bun pm cache rm

# 依存関係再インストール
rm -rf node_modules bun.lockb
bun install
```

### Next.js で CORS エラー

- FastAPI 側の CORS 設定を確認（上記参照）
- ブラウザの開発者ツールでエラー内容確認
- FastAPI が起動しているか確認

## モダンツールチェーン選定理由

### Python: uv を採用

**2025 年の状況**:

- uv は pip の 10-100 倍高速で、pip、pip-tools、virtualenv、poetry を単一ツールで置き換える
- Rust 製で爆速
- オールインワン（仮想環境 + パッケージ管理）
- `pyproject.toml` による標準的な設定

**選定理由**:

- **venv/pip は古い**：学習教材レベルのツール
- **業界トレンド**：2024 年リリース、急速に普及中
- **開発体験**：依存関係の解決が瞬時
- **Ruff 統合**：同じ Astral チーム製、相性抜群

### JavaScript: Bun を採用

**2025 年の状況**:

- Bun は Next.js、Express に対応し、npm の 10-20 倍高速、3-4 倍の HTTP スループット
- ランタイム + パッケージマネージャー + バンドラー + テストランナー
- JavaScriptCore（Safari）ベース

**選定理由**:

- **npm/yarn は遅い**：パッケージインストールに時間がかかる
- **オールインワン**：追加ツール不要
- **Next.js 対応**：公式サポート
- **学習コスト低**：npm と同じコマンド体系

### 従来ツールとの比較

| ツール      | 従来                         | 2025 年                          | 速度比較      |
| ----------- | ---------------------------- | -------------------------------- | ------------- |
| Python 環境 | venv + pip                   | **uv**                           | 10-100 倍高速 |
| Lint/Format | black + flake8 + isort       | **Ruff**                         | 10-100 倍高速 |
| JS 環境     | npm/yarn                     | **Bun**                          | 10-20 倍高速  |
| 開発体験    | ツール分散、設定ファイル多数 | オールインワン、設定ファイル最小 | 圧倒的改善    |

## Next Step

動作確認ができたら：

1. **reports テーブル追加**
2. **週報 CRUD API 実装**
3. **週報投稿画面実装**
4. **デプロイ（Fly.io + Vercel + Neon）**
