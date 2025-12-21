FROM oven/bun:1 AS base
WORKDIR /app

# 依存関係のインストール
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ソースコードのコピー
COPY . .

# ビルド
RUN bun run build

# 実行用イメージ
FROM oven/bun:1 AS release
WORKDIR /app

# スタンドアロンビルドの結果をコピー
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000

CMD ["bun", "run", "server.js"]