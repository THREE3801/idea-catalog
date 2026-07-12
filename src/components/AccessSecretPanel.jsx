import { useState } from "react";
import { Lock, X } from "lucide-react";
import { SECRET_STORAGE_KEY } from "../lib/supabaseClient";

export default function AccessSecretPanel({ onClose }) {
  const [value, setValue] = useState(
    () => window.localStorage.getItem(SECRET_STORAGE_KEY) || ""
  );
  const hasSecret = !!window.localStorage.getItem(SECRET_STORAGE_KEY);

  const save = () => {
    if (value.trim()) {
      window.localStorage.setItem(SECRET_STORAGE_KEY, value.trim());
    } else {
      window.localStorage.removeItem(SECRET_STORAGE_KEY);
    }
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(31,41,55,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-5 rounded-sm"
        style={{ background: "#FFFFFF", border: "1px solid #DEDFD8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5 text-sm"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1F2937" }}
          >
            <Lock size={14} />
            访问口令
          </div>
          <button onClick={onClose} style={{ color: "#9CA3AF" }}>
            <X size={16} />
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
          可选。设置后,口令会随每次请求发送,需要配合 Supabase 的 RLS
          策略校验才有实际保护效果(见部署文档)。留空并保存即可清除。
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入访问口令"
          className="w-full mb-3 px-3 py-2 text-sm rounded-sm outline-none"
          style={{ border: "1px solid #E2E2DB", color: "#1F2937" }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            {hasSecret ? "当前已设置口令" : "当前未设置口令"}
          </span>
          <button
            onClick={save}
            className="px-3 py-1.5 rounded-sm text-xs"
            style={{ background: "#2D5A6B", color: "#fff", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            保存并重新加载
          </button>
        </div>
      </div>
    </div>
  );
}
