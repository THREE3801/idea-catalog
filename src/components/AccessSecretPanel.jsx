import { useState } from "react";
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        background: "rgba(38,38,31,0.35)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "22px 24px",
          background: "#EFEDE4",
          border: "1px solid #CFCDC2",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(60,55,40,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ font: "600 13px 'IBM Plex Mono', monospace", color: "#26261F" }}>⌸ 访问口令</div>
          <button
            onClick={onClose}
            style={{ font: "14px 'IBM Plex Mono', monospace", color: "#8A8981", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        <p style={{ font: "12px 'Source Serif 4', serif", color: "#61605A", lineHeight: 1.6, margin: "0 0 14px" }}>
          可选。设置后,口令会随每次请求发送,需要配合 Supabase 的 RLS 策略校验才有实际保护效果(见部署文档)。留空并保存即可清除。
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入访问口令"
          style={{
            width: "100%",
            marginBottom: "14px",
            padding: "9px 11px",
            border: "1px solid #DEDDD3",
            borderRadius: "4px",
            background: "#FFFEFA",
            font: "13px 'IBM Plex Mono', monospace",
            color: "#26261F",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: "11px 'IBM Plex Mono', monospace", color: "#9A998F" }}>
            {hasSecret ? "当前已设置口令" : "当前未设置口令"}
          </span>
          <button
            onClick={save}
            style={{
              font: "12px 'IBM Plex Mono', monospace",
              color: "#F4F3EE",
              background: "#2A2A28",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "7px 16px",
            }}
          >
            保存并重新加载
          </button>
        </div>
      </div>
    </div>
  );
}
