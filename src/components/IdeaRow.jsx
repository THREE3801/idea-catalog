import { useState } from "react";
import { statusMeta, deadlineDisplay } from "../lib/statuses";

export default function IdeaRow({ idea, onCycleStatus, onDelete, onSaveEdit }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState({
    note: idea.note,
    link: idea.link,
    deadline: idea.deadline,
  });

  const st = statusMeta(idea.status);
  const dl = deadlineDisplay(idea);

  const startEdit = () => {
    setDraft({ note: idea.note, link: idea.link, deadline: idea.deadline });
    setEditing(true);
  };

  const saveEdit = () => {
    onSaveEdit(idea.id, draft);
    setEditing(false);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        padding: "16px 0",
        borderTop: "1px solid #E4E2D8",
        animation: "cardIn .3s ease both",
      }}
    >
      <button
        onClick={() => onCycleStatus(idea.id)}
        title="点击切换状态"
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          flex: "0 0 auto",
          marginTop: "3px",
          cursor: "pointer",
          background: st.bg,
          border: `2px solid ${st.dot}`,
          padding: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <h3
            style={{
              font: "600 18px 'Source Serif 4', serif",
              color: "#26261F",
              margin: 0,
              lineHeight: 1.4,
              flex: 1,
            }}
          >
            {idea.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", flex: "0 0 auto" }}>
            {!editing && (
              <button
                onClick={startEdit}
                style={{
                  font: "11.5px 'IBM Plex Mono', monospace",
                  color: "#9A998F",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                补充
              </button>
            )}
            {confirming ? (
              <>
                <button
                  onClick={() => onDelete(idea.id)}
                  style={{
                    font: "11.5px 'IBM Plex Mono', monospace",
                    color: "#B3423A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  确认删
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  style={{
                    font: "11.5px 'IBM Plex Mono', monospace",
                    color: "#8A8981",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                style={{
                  font: "11.5px 'IBM Plex Mono', monospace",
                  color: "#C6C4B9",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                删
              </button>
            )}
          </div>
        </div>

        {idea.note && !editing && (
          <p
            style={{
              font: "15px 'Source Serif 4', serif",
              color: "#5C5B54",
              lineHeight: 1.6,
              margin: "6px 0 0",
            }}
          >
            {idea.note}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap", marginTop: "9px" }}>
          <span style={{ font: "11.5px 'IBM Plex Mono', monospace", color: st.fg }}>{st.label}</span>
          {dl && (
            <span
              style={{
                font: "11.5px 'IBM Plex Mono', monospace",
                color: dl.urgent ? "#B3423A" : "#87867E",
                background: dl.urgent ? "#FBEAE8" : "transparent",
                padding: dl.urgent ? "1px 8px" : 0,
                borderRadius: dl.urgent ? "999px" : 0,
              }}
            >
              {dl.text}
            </span>
          )}
          {(idea.tags || []).map((tg) => (
            <span
              key={tg}
              style={{
                font: "11px 'IBM Plex Mono', monospace",
                color: "#87867E",
                background: "#EDEBE2",
                padding: "1px 8px",
                borderRadius: "999px",
              }}
            >
              #{tg}
            </span>
          ))}
          {idea.link && (
            <a
              href={idea.link}
              target="_blank"
              rel="noreferrer"
              style={{ font: "11.5px 'IBM Plex Mono', monospace", color: "#2D5A6B" }}
            >
              ↗ 链接
            </a>
          )}
        </div>

        {editing && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "9px" }}>
            <textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="备注(可选)"
              rows={2}
              style={{
                width: "100%",
                padding: "9px 11px",
                border: "1px solid #DEDDD3",
                borderRadius: "4px",
                background: "#FFFEFA",
                font: "14px 'Source Serif 4', serif",
                color: "#26261F",
                outline: "none",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: "9px" }}>
              <input
                value={draft.link}
                onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                placeholder="链接"
                style={{
                  flex: 1,
                  padding: "8px 11px",
                  border: "1px solid #DEDDD3",
                  borderRadius: "4px",
                  background: "#FFFEFA",
                  font: "13px 'IBM Plex Mono', monospace",
                  color: "#26261F",
                  outline: "none",
                }}
              />
              <input
                type="date"
                value={draft.deadline}
                onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                style={{
                  padding: "8px 11px",
                  border: "1px solid #DEDDD3",
                  borderRadius: "4px",
                  background: "#FFFEFA",
                  font: "13px 'IBM Plex Mono', monospace",
                  color: "#26261F",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "9px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  font: "12px 'IBM Plex Mono', monospace",
                  color: "#8A8981",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 10px",
                }}
              >
                取消
              </button>
              <button
                onClick={saveEdit}
                style={{
                  font: "12px 'IBM Plex Mono', monospace",
                  color: "#F4F3EE",
                  background: "#2A2A28",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "6px 16px",
                }}
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
