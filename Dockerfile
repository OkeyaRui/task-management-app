# Node.js 18の公式イメージを使用
FROM node:18-alpine AS base

# 依存関係をインストールするステージ
FROM base AS deps
# libc6-compatをインストール（Alpine Linux用）
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.jsonをコピー
COPY package.json ./
# 依存関係をインストール
RUN npm install --no-package-lock

# ソースコードをビルドするステージ
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.jsのビルド
RUN npm run build

# 本番用の軽量イメージを作成
FROM base AS runner
WORKDIR /app

# 本番環境の設定
ENV NODE_ENV production
# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルをコピー
COPY --from=builder /app/public ./public

# Next.jsのビルド成果物をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# nextjsユーザーに切り替え
USER nextjs

# ポート3000を公開
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# アプリケーションを起動
CMD ["node", "server.js"]
