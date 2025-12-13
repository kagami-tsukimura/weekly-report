-- usersテーブル作成
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テストデータ投入
INSERT INTO users (name) VALUES ('Alice'), ('Bob');

-- 確認
SELECT * FROM users;
