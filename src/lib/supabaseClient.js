import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SECRET_STORAGE_KEY = "idea-catalog:access-secret";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 环境变量,请检查 .env 文件"
  );
}

const storedSecret =
  typeof window !== "undefined"
    ? window.localStorage.getItem(SECRET_STORAGE_KEY)
    : null;

// 若配置了访问口令(见 README),口令会作为自定义 header 随每次请求发送,
// 由 Supabase 端的 RLS 策略校验。未配置时该 header 为空,不影响任何请求。
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: storedSecret ? { "x-app-secret": storedSecret } : {},
  },
});
