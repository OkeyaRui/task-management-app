# Supabase設定ガイド

## 問題: "Failed to fetch" エラーの解決

このエラーは、Supabaseの環境変数が正しく設定されていないことが原因です。

## 解決手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. アカウントを作成（まだの場合）
3. 「New Project」をクリック
4. プロジェクト名とパスワードを設定
5. リージョンを選択（Asia Northeast (Tokyo)推奨）
6. 「Create new project」をクリック

### 2. 認証情報の取得

1. プロジェクトが作成されたら、左サイドバーの「Settings」→「API」をクリック
2. 以下の値をコピー：
   - **Project URL** (例: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** キー (長い文字列)
   - **service_role** キー (秘密キー)

### 3. 環境変数ファイルの作成

プロジェクトルート（`package.json`と同じ階層）に`.env.local`ファイルを作成：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**重要**: `your-project-id`、`your_actual_anon_key_here`、`your_actual_service_role_key_here`を実際の値に置き換えてください。

### 4. データベーススキーマの設定

1. Supabaseの左サイドバーで「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下のSQLをコピー&ペーストして実行：

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

4. 「Run」ボタンをクリックして実行

### 5. 認証設定の確認

1. 左サイドバーの「Authentication」→「Settings」をクリック
2. **Site URL**に `http://localhost:3000` を設定
3. **Redirect URLs**に以下を追加：
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`

### 6. Dockerコンテナの再起動

```bash
# 既存のコンテナを停止
docker-compose down

# 開発環境を再起動
docker-compose --profile dev up --build

# または本番環境を再起動
docker-compose --profile prod up --build
```

### 7. 動作確認

1. ブラウザで http://localhost:3000 にアクセス
2. 「ログイン / 新規登録」ボタンが有効になっていることを確認
3. アカウント作成を試行

## トラブルシューティング

### エラーが続く場合

1. **環境変数の確認**
   ```bash
   # .env.localファイルの内容を確認
   cat .env.local
   ```

2. **Supabaseプロジェクトの状態確認**
   - プロジェクトが「Active」状態か確認
   - データベースが正常に動作しているか確認

3. **ネットワーク接続の確認**
   - インターネット接続を確認
   - ファイアウォールの設定を確認

4. **Dockerログの確認**
   ```bash
   docker-compose logs -f
   ```

### よくある問題

- **環境変数が読み込まれない**: `.env.local`ファイルの場所と内容を確認
- **SQLエラー**: SupabaseのSQL Editorでエラーメッセージを確認
- **認証エラー**: Site URLとRedirect URLsの設定を確認

## 完了

これらの手順を完了すると、「Failed to fetch」エラーが解決され、正常にアカウント作成ができるようになります。
