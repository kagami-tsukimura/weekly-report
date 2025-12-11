# Conversation Context (Markdown Export)

**Final tech stack (user request):** Next.js (frontend), Go + Gin (backend), PostgreSQL with Row Level Security (RLS).  
**Note:** All Rust-related content has been intentionally removed at user request.

---

**User:**  
RLS を学ぶための個人開発は？  
開発に組み込んで学びたい。  
転職でアピールできるよう、妥当な理由で採用したい。

**Assistant:**  
Row Level Security (RLS) を PostgreSQL で扱うのであれば、  
複数テナントや権限管理が発生するデータ管理アプリが最適です。  
例：週報管理、マルチテナントのタスク管理。

RLS の学び方で重要になるのは：

- テナント ID やユーザー ID を current_setting() でセッションに持たせる
- USING（読み込み）と WITH CHECK（書き込み）を分ける
- FORCE RLS でアプリ外からの抜け道を防ぐ

---

**User:**  
row level security  
postgres で

**Assistant:**  
PostgreSQL の RLS を使うなら、まず ENABLE と POLICY 設定が基本です。

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_based ON tasks
  USING (org_id = current_setting('app.current_org_id')::uuid);
```

セッション変数を使ってアプリ層から必ず `SET` します：

```sql
SET app.current_org_id = '...';
```

---

**User:**  
日報と週報で賛成。  
まずは週報、日報機能もいずれ持たせたい  
web システムとしてやるか、githubactions 使ってやる感じかどっちが良いかな？  
言語選定も相談したい。合理的な理由で。  
メンバーは 10 人から数十人スケール程度で検討

**Assistant:**  
GitHub Actions ベースにすると RLS の強みが活かせません。  
RLS を学ぶなら **Web システムで DB に接続する方式一択**です。

10〜数十人のメンバーであれば：

- Web UI
- 認証（Google, GitHub, 社内 SSO）
- 組織・メンバー・権限の設計
- 週報投稿、閲覧、検索

ここで RLS の出番になります。  
メンバーは自分の週報だけ閲覧、管理者は全件閲覧といった分離が自然にできます。

言語選定：

- Next.js（フロント）
- Go + Gin（バックエンド）
- PostgreSQL（RLS）

理由：  
トップダウンでシンプル、RLS のセッション変数操作が書きやすい、単体バイナリでデプロイ容易。

---

**User:**  
RLS で考えるなら、テナント分けを地方ごとに分離とか？  
それなら 50 人〜数百人スケール程度で考えたい。  
RLS で考えるべきことって他にあるのか？

**Assistant:**  
RLS で考えるときは「誰がどのレコードを見てもいいか？」をデータモデリングの最初に設計します。

考えるべきポイント：

1. テナント（地方など）をどう切るか
2. ユーザー（個人）をどう紐づけるか
3. ロール（管理者/一般）をどう区別するか
4. current_setting() に何を入れるか

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY self_only ON reports
  USING (user_id = current_setting('app.user_id')::uuid);
```

---

**User:**  
Next と gin でいくよ。  
Nest は業務で使っていたから。

ほぼ個人開発で、週に 10 時間程度は時間が取れると思う。  
工数概算はどれくらい？  
Next は少しだけ入門した程度、gin はかんたんなアプリを何個か作った程度。  
GO は CLI ツールで最近 2 週間くらい触った。

**Assistant:**  
週 10 時間ペースであれば、以下は現実的です：

- 最小 MVP（ログイン、週報投稿、閲覧、RLS）：6〜8 週間
- UI 調整・検索・権限管理拡張：+4〜6 週間  
  合計：およそ **2〜3 ヶ月（個人開発）**

RLS は DB 側の実装が決まってしまえば、  
アプリ層は「セッション変数のセット漏れを絶対にしない」設計だけ注意すれば成立します。
