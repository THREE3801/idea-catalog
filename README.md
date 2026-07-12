# 点子索引卡 · Idea Catalog

个人点子记录工具。记录要快到没有摩擦,整理是可选的。

## 本地运行

```bash
npm install
cp .env.example .env   # 然后把里面的 URL / key 换成你自己的
npm run dev
```

`.env` 需要两个变量:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx
```

- `VITE_SUPABASE_URL`:Supabase 后台 → 项目 → **Settings → API** → Project URL
- `VITE_SUPABASE_ANON_KEY`:同一页面里的 **anon / publishable key**(新版叫 `sb_publishable_...`,旧版叫 `anon` `public`,两者作用一致)

⚠️ **不要**把 `sb_secret_...`(旧称 service_role key)填进这个文件。这个项目是纯前端应用,`VITE_` 开头的变量会被打进浏览器可见的 JS 包里,secret key 一旦放进来就等于公开了数据库的完全访问权限。这个项目全程用不到 secret key。

## Supabase 建表

打开 Supabase 后台 → 左侧菜单 **SQL Editor** → **New query**,把 [supabase/schema.sql](supabase/schema.sql) 的全部内容粘贴进去,点 **Run**。

这一步会:
1. 建 `ideas` 表(字段对应任务文档里的数据结构,`num` 用数据库自增列,不会重复)
2. 开启 Row Level Security(RLS)
3. 默认加一条"匿名 key 可完全读写"的策略,这样个人使用最省事

## 访问口令保护(可选)

网页右上角有个锁形图标,点开可以设置一个访问口令,口令只存在你自己浏览器的 localStorage 里,**不会写进代码或 Supabase**。设置后,前端会把这个口令当作 `x-app-secret` 请求头随每次请求发送。

但光设置口令本身不会真的挡住任何人 —— 必须在 Supabase 那边配合开启校验,策略才会生效:

1. 在 `schema.sql` 里找到"方案 B"那一段被注释掉的 SQL
2. 把其中的 `CHANGE-ME-TO-YOUR-OWN-SECRET` 改成和网页里设置的口令完全一致的字符串
3. 在 SQL Editor 里先执行 `drop policy "anon full access" on ideas;`,再执行方案 B 的 `create policy ...`

不想加保护就什么都不用做,方案 A(默认策略)已经够用 —— 只是意味着任何拿到你网址的人都能读写数据,取决于你会不会把网址到处分享。

## 部署到 Vercel

1. 把这个项目推到一个 GitHub 仓库(这一步文档假设你已经在用 git;如果 `idea-catalog` 目录还没初始化 git,先执行 `git init && git add . && git commit -m "init"`,再关联远程仓库并 push)
2. 去 [vercel.com](https://vercel.com) → **Add New Project** → 选中这个仓库导入
3. Framework Preset 会自动识别为 **Vite**,不用改构建命令(`npm run build`)和输出目录(`dist`)
4. 在 **Environment Variables** 里加两条(和本地 `.env` 内容一致):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 点 **Deploy**,几十秒后会给一个 `xxx.vercel.app` 的地址

## 绑定自定义域名(如 ideas.three380.com)

1. Vercel 项目页 → **Settings → Domains** → 输入 `ideas.three380.com` → **Add**
2. Vercel 会给出需要添加的 DNS 记录,通常是一条 **CNAME**,指向 `cname.vercel-dns.com`(具体以 Vercel 页面显示为准)
3. 去你域名 `three380.com` 的 DNS 服务商后台,添加这条 CNAME 记录:
   - 主机名/Name: `ideas`
   - 类型: `CNAME`
   - 值: Vercel 页面给出的目标地址
4. 等 DNS 生效(一般几分钟到几十分钟),Vercel 会自动签发 HTTPS 证书,Domains 页面状态变成 **Valid** 即完成

## 目录结构

```
src/
  lib/
    supabaseClient.js   # Supabase 客户端初始化
    storage.js           # 增删改查
    statuses.js          # 状态常量、截止日期计算、URL 识别
    export.js             # 导出 JSON / 纯文本
  components/
    IdeaCard.jsx          # 单张点子卡片(状态切换、补充编辑、删除确认)
    AccessSecretPanel.jsx # 访问口令设置面板
  App.jsx                  # 页面整体布局与状态管理
supabase/
  schema.sql               # 建表 + RLS 策略
```

## 明确没做的

按任务文档要求,没有加用户登录、AI 分析、标签系统、付费/推广相关功能。
