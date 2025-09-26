# Docker環境での開発

このプロジェクトはDockerを使用した開発環境をサポートしています。Dockerを使用することで、環境の違いによる問題を回避し、一貫した開発環境を提供します。

## 前提条件

- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること

## 利用可能なDocker環境

### 1. 開発環境 (`dev`)
- ホットリロード対応
- ソースコードの変更が即座に反映
- デバッグに最適

### 2. 本番環境 (`prod`)
- 本番環境と同じ設定
- パフォーマンステスト用

### 3. 本番環境（マルチステージビルド）(`production`)
- 最適化された本番環境
- 最小限のイメージサイズ
- 本番デプロイ用

## 使用方法

### 開発環境の起動

```bash
# npmスクリプトを使用
npm run docker:dev

# または直接docker-composeを使用
docker-compose --profile dev up --build
```

### 本番環境の起動

```bash
# 本番環境
npm run docker:prod

# マルチステージビルド本番環境
npm run docker:production
```

### コンテナの管理

```bash
# コンテナを停止
npm run docker:down

# コンテナとイメージを削除
npm run docker:clean

# ログを確認
docker-compose logs -f

# コンテナ内でコマンドを実行
docker-compose exec app-dev sh
```

## 環境変数の設定

Docker環境では、以下の環境変数を設定できます：

```bash
# .env.local ファイルを作成
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## ファイル構成

```
├── Dockerfile              # 本番用Dockerfile
├── Dockerfile.dev          # 開発用Dockerfile
├── Dockerfile.prod         # 本番用Dockerfile（マルチステージ）
├── docker-compose.yml      # Docker Compose設定
├── .dockerignore           # Docker用の除外ファイル
└── env.docker             # Docker用環境変数サンプル
```

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# ポートを変更して起動
docker-compose --profile dev up --build -p 3001:3000
```

### キャッシュの問題

```bash
# キャッシュを無視してビルド
docker-compose --profile dev build --no-cache
```

### ボリュームの問題

```bash
# ボリュームを削除して再作成
docker-compose down -v
docker-compose --profile dev up --build
```

## パフォーマンス最適化

### 開発環境
- ホットリロードを有効化
- ソースコードの変更を監視
- デバッグ情報を出力

### 本番環境
- マルチステージビルドでイメージサイズを最小化
- 不要なファイルを除外
- セキュリティを強化

## セキュリティ

- 非rootユーザーでアプリケーションを実行
- 最小限の依存関係のみインストール
- 不要なファイルを除外

## 監視とログ

```bash
# リアルタイムログを確認
docker-compose logs -f app-dev

# 特定のサービスのログを確認
docker-compose logs app-dev

# ログをファイルに出力
docker-compose logs > logs.txt
```

## 本番デプロイ

Docker環境を本番環境にデプロイする場合：

1. 環境変数を適切に設定
2. セキュリティ設定を確認
3. リバースプロキシの設定
4. SSL証明書の設定
5. 監視とログの設定

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)
- [Next.js Docker公式ガイド](https://nextjs.org/docs/deployment#docker-image)
