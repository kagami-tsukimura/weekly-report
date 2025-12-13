FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

# 依存関係のインストール
COPY pyproject.toml .
RUN uv sync

# ソースコードのコピー
COPY . .

# アプリケーションの実行
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
