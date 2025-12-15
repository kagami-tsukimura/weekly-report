-- usersテーブル作成
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- reportsテーブル作成 (週報データ)
CREATE TABLE IF NOT EXISTS reports (
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

-- テストデータ投入
INSERT INTO users (name) VALUES ('Alice'), ('Bob');
INSERT INTO reports (user_id, week_start, done, todo, issues, learning_hours) VALUES 
(1, CURRENT_DATE, '開発環境構築', '週報モックの実装', '特になし', 2.5),
(2, CURRENT_DATE, '要件定義', 'DB設計', '時間が足りない', 1.5);

-- 確認
SELECT * FROM users;
SELECT * FROM reports;