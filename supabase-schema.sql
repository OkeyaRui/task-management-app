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
  start_time time,          -- 任意
  end_time time,            -- 任意
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
