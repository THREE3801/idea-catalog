-- 在 Supabase 后台执行: 左侧菜单 SQL Editor -> New query -> 粘贴本文件全部内容 -> Run

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  num bigint generated always as identity,
  title text not null,
  note text not null default '',
  link text not null default '',
  deadline date,
  status text not null default 'pending'
    check (status in ('pending', 'doing', 'dropped', 'done')),
  created_at timestamptz not null default now()
);

alter table ideas enable row level security;

-- ============================================================
-- 方案 A(默认): 不设访问口令,anon key 可直接读写。
-- 个人使用、且不打算公开分享网址的情况下,这样最简单。
-- ============================================================
create policy "anon full access" on ideas
  for all
  using (true)
  with check (true);

-- ============================================================
-- 方案 B(可选,更安全): 启用访问口令保护。
-- 如果你在网页右上角的"锁"图标里设置了访问口令,前端会把这个口令
-- 作为 x-app-secret 请求头随每次请求发送。启用本方案后,
-- 没有正确口令的请求会被数据库拒绝。
--
-- 启用步骤:
-- 1. 把下面 'CHANGE-ME-TO-YOUR-OWN-SECRET' 改成你自己的口令(和网页里设置的一致)
-- 2. 先执行: drop policy "anon full access" on ideas;
-- 3. 再执行下面这段(去掉最前面的 -- 注释符号后执行)
-- ============================================================

-- create policy "require app secret" on ideas
--   for all
--   using (
--     coalesce(current_setting('request.headers', true)::json->>'x-app-secret', '')
--       = 'CHANGE-ME-TO-YOUR-OWN-SECRET'
--   )
--   with check (
--     coalesce(current_setting('request.headers', true)::json->>'x-app-secret', '')
--       = 'CHANGE-ME-TO-YOUR-OWN-SECRET'
--   );
