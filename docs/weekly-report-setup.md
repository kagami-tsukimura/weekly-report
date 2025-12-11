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
4. GO（バックエンド）
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
node_modules/
.env
.env.local
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

## 4. GO（バックエンド）

### ディレクトリ作成

```bash
mkdir backend
cd backend
```

### Go 初期化

```bash
# Goモジュール初期化
go mod init weekly-report

# 必要なパッケージインストール
go get github.com/gin-gonic/gin
go get github.com/lib/pq
```

### main.go 作成（最小構成）

```go
package main

import (
 "database/sql"
 "log"
 "net/http"

 "github.com/gin-gonic/gin"
 _ "github.com/lib/pq"
)

func main() {
 // DB接続
 db, err := sql.Open("postgres", "postgres://dev:dev@localhost:5432/weekly_report?sslmode=disable")
 if err != nil {
  log.Fatal(err)
 }
 defer db.Close()

 // 接続確認
 if err := db.Ping(); err != nil {
  log.Fatal(err)
 }
 log.Println("DB connected!")

 // Ginルーター
 r := gin.Default()

 // ヘルスチェック
 r.GET("/health", func(c *gin.Context) {
  c.JSON(http.StatusOK, gin.H{"status": "ok"})
 })

 // ユーザー一覧
 r.GET("/users", func(c *gin.Context) {
  rows, err := db.Query("SELECT id, name FROM users")
  if err != nil {
   c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
   return
  }
  defer rows.Close()

  var users []map[string]interface{}
  for rows.Next() {
   var id int
   var name string
   rows.Scan(&id, &name)
   users = append(users, map[string]interface{}{
    "id":   id,
    "name": name,
   })
  }

  c.JSON(http.StatusOK, users)
 })

 // サーバー起動
 r.Run(":8080")
}
```

### バックエンド起動確認

```bash
# サーバー起動
go run main.go

# 別ターミナルで確認
curl http://localhost:8080/health
curl http://localhost:8080/users
```

### バックエンドコミット

```bash
cd ..  # プロジェクトルートに戻る
git add backend/
git commit -m "feat: add Go backend with /users endpoint"
```

## 5. Next（フロントエンド）

### Next.js 作成

```bash
# フロントエンドディレクトリ作成
mkdir frontend
cd frontend

# Next.js初期化
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

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
    fetch('http://localhost:8080/users')
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
npm run dev
# → http://localhost:3000 にアクセス
```

### CORS 設定（必要な場合）

Go 側の `main.go` に追加：

```go
import "github.com/gin-contrib/cors"

// ...

r := gin.Default()

// CORS設定
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"http://localhost:3000"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
}))
```

```bash
# パッケージインストール
cd backend
go get github.com/gin-contrib/cors
```

### フロントエンドコミット

```bash
cd ..  # プロジェクトルートに戻る
git add frontend/
git commit -m "feat: add Next.js frontend with user list"
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

# 4. Go実装（10分）
# backend/main.go作成
go run main.go

# 5. Next実装（5分）
# frontend/app/page.tsx編集
npm run dev
```

## ディレクトリ構成

```text
weekly-report/
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── go.mod
│   ├── go.sum
│   └── main.go
└── frontend/
    ├── package.json
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

### Go でエラー

```bash
# 依存パッケージ再取得
go mod tidy

# キャッシュクリア
go clean -modcache
```

### Next.js で CORS エラー

- Go 側に CORS 設定を追加（上記参照）
- ブラウザの開発者ツールでエラー内容確認

## PostgreSQL GUI ツール比較（参考）

### 採用：DBeaver

**選定理由**:

- 業界標準で最も人気のある PostgreSQL GUI ツール
- 実務でも広く使われている（転職時のアピール材料）
- ER 図の自動生成、データエクスポート、クエリ履歴管理など高機能
- RLS 学習に有利（複数ユーザーセッションの切り替えが容易）
- 長期的に使えるスキル

### その他の選択肢

#### VSCode 拡張

- 学習コスト最小
- エディタで完結
- 機能は限定的

#### pgAdmin（PostgreSQL 公式）

- PostgreSQL 専用
- 管理者向け
- UI が複雑

### まとめ

個人開発・MVP 段階でも**DBeaver を採用**：

- 少しの学習コストで長く使える
- 実務スキルとして価値がある
- RLS 実装時に役立つ機能が豊富

VSCode 拡張は「楽」だが、学習・転職アピール目的なら DBeaver が最適。

## Next Step

動作確認ができたら：

1. **reports テーブル追加**
2. **週報 CRUD API 実装**
3. **週報投稿画面実装**
4. **デプロイ（Fly.io + Vercel + Neon）**

まずは動かしてみて、困ったことがあればその時に調べましょう！
