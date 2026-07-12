import { useState } from "react";
import { Link2, Trash2, Circle, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { STATUSES, statusMeta, deadlineLabel } from "../lib/statuses";

export default function IdeaCard({ idea, onStatusChange, onDelete, onSaveEdit }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState({
    note: idea.note,
    link: idea.link,
    deadline: idea.deadline,
  });

  const meta = statusMeta(idea.status);
  const dl = deadlineLabel(idea.deadline);
  const isUrgent = dl && dl.urgent && idea.status !== "done" && idea.status !== "dropped";

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
      className="relative p-4 rounded-sm group"
      style={{
        background: "#FFFFFF",
        border: "1px solid #DEDFD8",
        borderLeftWidth: "3px",
        borderLeftColor: isUrgent ? "#B3423A" : "#DEDFD8",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#B0B0A8" }}>
              #{String(idea.num).padStart(3, "0")}
            </span>
            <Circle size={5} fill="#D0D0C8" color="#D0D0C8" />
            <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#B0B0A8" }}>
              {new Date(idea.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
          <div className="text-base mb-1" style={{ fontFamily: "'Source Serif 4', serif", color: "#1F2937", fontWeight: 600 }}>
            {idea.title}
          </div>
          {idea.note && !editing && (
            <div className="text-sm mb-2" style={{ color: "#6B7280" }}>
              {idea.note}
            </div>
          )}
          {idea.link && !editing && (
            <a
              href={idea.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs mb-2"
              style={{ color: "#2D5A6B", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <Link2 size={11} /> {idea.link.replace(/^https?:\/\//, "").slice(0, 40)}
            </a>
          )}

          {editing && (
            <div className="mb-3 mt-2 flex flex-col gap-2">
              <textarea
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="备注(可选)"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-sm outline-none resize-none"
                style={{ border: "1px solid #E2E2DB", color: "#4B5563" }}
              />
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[160px] flex items-center gap-2 px-3 py-2 rounded-sm" style={{ border: "1px solid #E2E2DB" }}>
                  <Link2 size={14} color="#9CA3AF" />
                  <input
                    value={draft.link}
                    onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                    placeholder="链接(可选)"
                    className="w-full text-sm outline-none"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#4B5563" }}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ border: "1px solid #E2E2DB" }}>
                  <input
                    type="date"
                    value={draft.deadline}
                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                    className="text-sm outline-none"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#4B5563" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs"
                  style={{ background: "#2D5A6B", color: "#fff", fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  <Check size={13} /> 保存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs"
                  style={{ background: "#E5E7E4", color: "#1F2937", fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  <X size={13} /> 取消
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <select
              value={idea.status}
              onChange={(e) => onStatusChange(idea.id, e.target.value)}
              className="text-xs px-2 py-1 rounded-sm outline-none cursor-pointer"
              style={{ fontFamily: "'IBM Plex Mono', monospace", background: meta.bg, color: meta.color, border: "none" }}
            >
              {STATUSES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            {dl && (
              <span
                className="text-xs px-2 py-1 rounded-sm"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: dl.urgent ? "#FBEAE8" : "#F1F1EF",
                  color: dl.urgent ? "#B3423A" : "#9CA3AF",
                }}
              >
                {dl.text}
              </span>
            )}
            {!editing && (
              <button
                onClick={startEdit}
                className="flex items-center gap-0.5 text-xs px-2 py-1 rounded-sm"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9CA3AF" }}
              >
                补充 <ChevronDown size={12} />
              </button>
            )}
            {editing && (
              <span className="flex items-center gap-0.5 text-xs px-2 py-1" style={{ color: "#9CA3AF" }}>
                <ChevronUp size={12} />
              </span>
            )}
          </div>
        </div>

        {!confirmingDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
            style={{ color: "#B0B0A8" }}
          >
            <Trash2 size={14} />
          </button>
        )}
        {confirmingDelete && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs" style={{ color: "#B3423A", fontFamily: "'IBM Plex Mono', monospace" }}>
              确认删除?
            </span>
            <button
              onClick={() => onDelete(idea.id)}
              className="text-xs px-2 py-1 rounded-sm"
              style={{ background: "#B3423A", color: "#fff", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              删除
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-xs px-2 py-1 rounded-sm"
              style={{ background: "#E5E7E4", color: "#1F2937", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
