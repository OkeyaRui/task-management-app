# タスク管理アプリ

カレンダーを主ビューとしたシンプルで見やすいタスク管理アプリです。

## 機能

- 📅 **カレンダー表示**: 月表示のカレンダーでタスクを視覚的に管理
- ✅ **タスク管理**: タスクの作成、編集、削除、完了状態の切り替え
- 📋 **直近タスク**: 今日から7日以内の未完了タスクを一覧表示
- 🔍 **検索・フィルタ**: タスクの検索とステータス・優先度での絞り込み
- 🔐 **認証**: メールアドレスとパスワードでのログイン・新規登録
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップに対応

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL, Auth, RLS)
- **デプロイ**: Vercel
- **その他**: Zod (バリデーション), Lucide React (アイコン)

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd task-management-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 2-1. Docker環境でのセットアップ（推奨）

Dockerを使用する場合は、以下のコマンドで簡単にセットアップできます：

```bash
# 開発環境で起動
npm run docker:dev

# または直接docker-composeを使用
docker-compose --profile dev up --build
```

**注意**: Docker環境では、環境変数の設定は不要ですが、Supabaseの機能を使用する場合は環境変数を設定してください。

#### 環境変数の設定（オプション）

Supabaseの機能を使用する場合は、`.env.local`ファイルを作成してください：

```bash
# .env.local ファイルを作成
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 4. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. データベーススキーマの設定

SupabaseのSQL Editorで`supabase-schema.sql`の内容を実行：

```sql
-- ステータス/優先度の型定義
create type task_status as enum ('todo','in_progress','done');
create type task_priority as enum ('low','medium','high');

-- プロファイル（auth.users に対応）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- タスク
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  due_date date not null,
  start_time time,
  end_time time,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 更新トリガー関数
create or replace function public.set_updated_at()
returns trigger as $$ 
begin 
  new.updated_at = now(); 
  return new; 
end; 
$$ language plpgsql;

-- 更新トリガー
create trigger trg_tasks_updated 
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger trg_profiles_updated 
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- インデックス
create index idx_tasks_user_date on public.tasks(user_id, due_date);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_priority on public.tasks(priority);

-- RLS（Row Level Security）
alter table public.tasks enable row level security;
alter table public.profiles enable row level security;

-- タスクのRLSポリシー
create policy "tasks_select_own" on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own" on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own" on public.tasks for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_delete_own" on public.tasks for delete
  using (auth.uid() = user_id);

-- プロファイルのRLSポリシー
create policy "profiles_self" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- プロファイル自動作成関数
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- 新規ユーザー作成時のトリガー
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 6. 開発サーバーの起動

#### 通常の開発環境
```bash
npm run dev
```

#### Docker環境
```bash
# 開発環境で起動
npm run docker:dev

# 本番環境で起動
npm run docker:prod

# 本番環境（マルチステージビルド）で起動
npm run docker:production
```

#### Docker環境の管理
```bash
# コンテナを停止
npm run docker:down

# コンテナとイメージを削除
npm run docker:clean
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## デプロイ

### Vercelでのデプロイ

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubリポジトリをVercelに接続
3. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. デプロイを実行

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── auth/              # 認証関連
│   ├── calendar/          # カレンダー関連
│   ├── task/              # タスク関連
│   └── ui/                # 共通UIコンポーネント
├── lib/                   # ユーティリティ関数
│   ├── supabase/          # Supabase設定
│   ├── validators.ts      # バリデーション
│   ├── tz.ts             # タイムゾーン処理
│   └── utils.ts           # 共通ユーティリティ
├── types/                 # TypeScript型定義
└── styles/                # スタイルファイル
    └── globals.css        # グローバルスタイル
```

## 主要機能の説明

### カレンダー表示
- 月表示のカレンダーでタスクを視覚的に管理
- 日付セルをクリックしてタスクを表示
- タスクの優先度に応じた色分け表示

### タスク管理
- タスクの作成、編集、削除
- 期日、開始時刻、終了時刻の設定
- 優先度（高・中・低）とステータス（未着手・進行中・完了）の管理

### 直近タスク
- 今日から7日以内の未完了タスクを一覧表示
- 日付ごとにグループ化
- 期日順でソート

### 認証
- メールアドレスとパスワードでのログイン・新規登録
- パスワードリセット機能
- 行レベルセキュリティ（RLS）によるデータ保護

## ライセンス

MIT License
