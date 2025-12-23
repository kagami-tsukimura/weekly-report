-- ロール作成
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';

-- テーブル作成
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    auth_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    week_start DATE NOT NULL,
    done TEXT NOT NULL,
    todo TEXT NOT NULL,
    issues TEXT,
    learning_hours FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 権限付与
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- RLS設定
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_reports ON reports FOR SELECT
USING (user_id IN (SELECT id FROM users WHERE auth_id = current_setting('app.current_user_id', true)));

CREATE POLICY insert_own_reports ON reports FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = current_setting('app.current_user_id', true)));