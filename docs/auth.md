# 認証設計

## 方針

- **NextAuth.js (Auth.js v5)** を採用
- 転職ポートフォリオとしてモダンな認証を実装
- RLS と連携し、データアクセス制御を実現

---

## 選定結果

### 認証プロバイダー

| `項目`           | `選定`                          |
| ---------------- | ------------------------------- |
| `プロバイダー`   | `Google OAuth` + `GitHub OAuth` |
| `セッション管理` | `JWT`                           |
| `RLS連携方式`    | `OAuthプロバイダーID`           |

---

## 選定理由

### Google OAuth

| `観点`             | `評価`                                    |
| ------------------ | ----------------------------------------- |
| `採用率`           | `BtoCで最もメジャー`                      |
| `ユーザー体験`     | `ほぼ全員がアカウント所持`                |
| `ポートフォリオ`   | `一般向けサービス想定として必須`          |
| `セットアップ`     | `GCP Console で Client ID/Secret を取得` |

### GitHub OAuth

| `観点`             | `評価`                                    |
| ------------------ | ----------------------------------------- |
| `採用率`           | `開発者向けサービスで標準`                |
| `ユーザー体験`     | `開発者なら必ず所持`                      |
| `ポートフォリオ`   | `技術理解をアピール`                      |
| `セットアップ`     | `GitHub Developer Settings で即時作成`   |

### JWT セッション

| `観点`           | `評価`                                 |
| ---------------- | -------------------------------------- |
| `DBアクセス`     | `不要（Neon無料枠節約）`               |
| `Edge対応`       | `Vercel Edge Runtime で動作`           |
| `スケーラビリティ` | `ステートレスで水平スケール容易`     |
| `セキュリティ`   | `署名検証で改竄防止`                   |

### RLS連携: OAuthプロバイダーID

| `観点`           | `評価`                                          |
| ---------------- | ----------------------------------------------- |
| `永続性`         | `ユーザーに紐づく一意ID（セッション毎に変わらない）` |
| `一意性`         | `OAuth プロバイダーが保証`                      |
| `シンプルさ`     | `OAuth レスポンスから直接取得`                  |
| `デバッグ`       | `github:12345 形式でログ追跡が容易`             |

---

## ボツ案と理由

### 認証

| `候補`                   | `ボツ理由`                                                   |
| ------------------------ | ------------------------------------------------------------ |
| `Credentials (Email/Pass)` | `パスワード管理・ハッシュ化の責任が発生、MVP では過剰`     |
| `Magic Link`             | `メール送信サービス（Resend等）の設定が必要、コスト増`       |
| `Passkey (WebAuthn)`     | `2024年時点で普及途上、ブラウザ対応にばらつき`               |
| `Apple OAuth`            | `開発者アカウント年額 $99 必要、無料枠対象外`                |
| `Twitter/X OAuth`        | `API 有料化で不安定、ポートフォリオ向けではない`             |

### セッション管理

| `候補`             | `ボツ理由`                                                 |
| ------------------ | ---------------------------------------------------------- |
| `Database Session` | `セッション毎に DB アクセス発生、Neon 無料枠消費大`        |

### RLS連携方式

| `候補`             | `ボツ理由`                                                 |
| ------------------ | ---------------------------------------------------------- |
| `セッションID`     | `セッション毎に変わるため、永続的なユーザー識別に不向き`   |
| `カスタム生成ID`   | `自前で一意性担保が必要、OAuth ID で十分`                  |

---

## 技術スタック

### Auth.js v5 の特徴

| `特徴`           | `説明`                                              |
| ---------------- | --------------------------------------------------- |
| `App Router対応` | `React Server Components, Server Actions と統合`   |
| `統一API`        | `auth() 関数で全コンテキストからセッション取得`    |
| `Edge互換`       | `Vercel Edge, Cloudflare Workers で動作`           |
| `OAuth/OIDC準拠` | `厳格なセキュリティ標準`                           |

### 環境変数

```bash
# .env.local (フロントエンド)
AUTH_SECRET=<生成した秘密鍵>
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>
AUTH_GITHUB_ID=<GitHub Client ID>
AUTH_GITHUB_SECRET=<GitHub Client Secret>
```

---

## データ設計

### users テーブル

```sql
-- auth_id に OAuth プロバイダーID を格納
-- 例: 'github:12345', 'google:abc123def456'
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    auth_id TEXT UNIQUE NOT NULL,  -- 'provider:providerAccountId' 形式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 認証フロー

```text
1. ユーザーがログインボタンクリック
2. Auth.js が OAuth プロバイダーにリダイレクト
3. ユーザーが認証・承認
4. Auth.js が JWT セッション作成
   - jwt callback で auth_id = 'provider:providerAccountId' を格納
5. Server Action / API Route からセッション取得
6. Backend API に X-Auth-ID ヘッダーで auth_id を送信
7. PostgreSQL で SET app.current_user_id = 'auth_id'
8. RLS ポリシーがユーザーのデータのみ返却
```

---

## 参考リンク

- [Auth.js 公式ドキュメント](https://authjs.dev/)
- [Next.js App Router + Auth.js](https://authjs.dev/getting-started/installation?framework=next.js)
- [Google OAuth 設定](https://console.cloud.google.com/apis/credentials)
- [GitHub OAuth 設定](https://github.com/settings/developers)
