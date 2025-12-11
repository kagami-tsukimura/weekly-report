# 技術スタック選定（学習コスト指標付き）

> 目的：RLS（Row Level Security）を PostgreSQL で実践し、Next.js + Go/Gin による Web システムとして MVP を構築する。  
> 「学習コスト」「対抗技術との比較」「採用理由」を明文化する。

---

## 1. フロントエンド

**技術：Next.js**  
**学習コスト：中（React 経験があれば低）**

### 採用理由

- 認証（NextAuth.js）が標準化されている
- v0 による UI 自動生成で MVP が高速化

### 対抗トレンド（比較）

- Remix：SSR に優れるが採用市場は狭い
- SvelteKit：学習コスト中、採用実績は少なめ

---

## 2. バックエンド

**技術：Go + Gin**  
**学習コスト：中**

### 採用理由

- middleware で `SET app.current_user_id` を実装可能
- RLS をアプリ側ではなく DB 側に委譲できる
- 単体バイナリでデプロイが容易

### 対抗トレンド（比較）

- FastAPI：学習コスト低だが DB 側制御の思想が薄い
- Fiber：高速だがエコシステムが小さい

---

## 3. SQL レイヤー

**技術：sqlc + pgx（明記）**  
**学習コスト：中（SQL 理解が前提）**

### 採用理由

- RLS を扱うため生 SQL を維持したい
- `pgx` は Go における事実上の標準 PostgreSQL driver
- 型安全かつ明示的なクエリ制御

### 対抗トレンド（比較）

- GORM：抽象化により RLS が破壊される可能性
- Prisma：Node 向けで Go とは整合しない

---

## 4. DB / マイグレーション

**技術：PostgreSQL + golang-migrate + atlas（検討）**  
**学習コスト：中**

### 採用理由

- PostgreSQL の RLS を直接利用
- schema / policy をファイル管理しやすい

### 改善点

- **atlas の採用検討**
  - schema diff が視覚化される
  - RLS ポリシー差分管理に有利

---

## 5. 認証（MVP → 拡張）

**技術：X-User-ID → NextAuth.js**  
**学習コスト：低 → 中**

### 採用理由

- MVP ではヘッダのみでユーザー識別
- 後から OAuth 追加可能

---

## 6. 学習コストまとめ

| 層  | 技術                         | 学習コスト | 理由                          |
| --- | ---------------------------- | ---------- | ----------------------------- |
| 1   | Next.js                      | 中         | UI/UX、認証対応               |
| 2   | Go + Gin                     | 中         | middleware でユーザー情報注入 |
| 3   | sqlc + pgx                   | 中         | RLS の最適解                  |
| 4   | PostgreSQL + migrate + atlas | 中         | RLS 管理とマイグレーション    |

---

## 7. 全体結論

- **pgx の明記と atlas の検討**が改善点
- RLS 学習、および転職アピール用途として合理的な選択
- ORM を避け、生 SQL の理解を深める点が評価対象になる

---
