import { useEffect, useState } from "react";
import { ORDER, STATUS, cycleStatus as nextStatus } from "./lib/statuses";
import { parseInput } from "./lib/parseIntent";
import { fetchIdeas, createIdea, updateIdea, deleteIdea } from "./lib/storage";
import { exportAsJson, exportAsText } from "./lib/export";
import IdeaRow from "./components/IdeaRow";
import ParsePreview from "./components/ParsePreview";
import AccessSecretPanel from "./components/AccessSecretPanel";

const FILTERS = [["all", "全部"], ...ORDER.map((k) => [k, STATUS[k].label])];

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [showSecretPanel, setShowSecretPanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchIdeas();
        setIdeas(data);
      } catch (e) {
        setError("加载失败,请检查 Supabase 配置或网络");
        console.error(e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    const raw = draft.trim();
    if (!raw) return;
    const p = parseInput(raw);
    try {
      const entry = await createIdea({
        title: p.title || raw,
        link: p.link,
        deadline: p.deadline,
        status: p.status,
        tags: p.tags,
      });
      setIdeas((prev) => [entry, ...prev]);
      setDraft("");
      setError("");
    } catch (err) {
      setError("保存失败,请重试");
      console.error(err);
    }
  };

  const handleCycleStatus = async (id) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const status = nextStatus(idea.status);
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await updateIdea(id, { status });
    } catch (e) {
      setError("状态更新失败,请重试");
      console.error(e);
    }
  };

  const handleSaveEdit = async (id, patch) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    try {
      await updateIdea(id, patch);
    } catch (e) {
      setError("保存失败,请重试");
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    const prev = ideas;
    setIdeas((cur) => cur.filter((i) => i.id !== id));
    try {
      await deleteIdea(id);
    } catch (e) {
      setIdeas(prev);
      setError("删除失败,请重试");
      console.error(e);
    }
  };

  const counts = { all: ideas.length };
  ORDER.forEach((k) => (counts[k] = ideas.filter((i) => i.status === k).length));
  const filtered = filter === "all" ? ideas : ideas.filter((i) => i.status === filter);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "60px 20px",
        background: "radial-gradient(120% 90% at 50% 0%, #DAD8CE 0%, #CFCDC2 100%)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "660px",
          margin: "0 auto",
          background: "#EFEDE4",
          border: "1px solid #CFCDC2",
          borderRadius: "8px",
          padding: "32px 34px 30px",
          boxShadow: "0 10px 30px rgba(60,55,40,0.10)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "22px" }}>
          <div style={{ font: "500 11px 'IBM Plex Mono', monospace", letterSpacing: "0.16em", color: "#A09E93" }}>
            IDEA CATALOG · 意图捕获
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={() => setShowSecretPanel(true)}
              title="访问口令设置"
              style={{ font: "14px 'IBM Plex Mono', monospace", color: "#A09E93", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ⌸
            </button>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                title="导出数据"
                style={{
                  font: "12px 'IBM Plex Mono', monospace",
                  color: "#4B4A44",
                  background: "#FCFBF5",
                  border: "1px solid #D8D7CD",
                  borderRadius: "3px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                ↓ 导出
              </button>
              {showExportMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "4px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    zIndex: 10,
                    background: "#FFFEFA",
                    border: "1px solid #E2E1D7",
                    boxShadow: "0 8px 24px rgba(50,45,35,0.16)",
                    minWidth: "128px",
                  }}
                >
                  <button
                    onClick={() => {
                      exportAsJson(ideas);
                      setShowExportMenu(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      font: "12px 'IBM Plex Mono', monospace",
                      color: "#26261F",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    导出为 JSON
                  </button>
                  <button
                    onClick={() => {
                      exportAsText(ideas);
                      setShowExportMenu(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      font: "12px 'IBM Plex Mono', monospace",
                      color: "#26261F",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    导出为纯文本
                  </button>
                </div>
              )}
            </div>
            <span style={{ font: "12px 'IBM Plex Mono', monospace", color: "#AEACA1" }}>{ideas.length} 条</span>
          </div>
        </div>

        {/* Intent input */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              padding: "16px 18px",
              background: "#FCFBF6",
              border: "1px solid #D6D5CA",
              borderRadius: "8px",
            }}
          >
            <span style={{ font: "15px 'IBM Plex Mono', monospace", color: "#C9B27A", flex: "0 0 auto", paddingTop: "1px" }}>✳</span>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="写点什么都行:读完《思维的乐趣》写笔记 下周五前 #写作 …"
              style={{
                flex: 1,
                border: "none",
                background: "none",
                font: "17px 'Source Serif 4', serif",
                color: "#26261F",
                outline: "none",
                lineHeight: 1.5,
              }}
            />
            <span style={{ font: "13px 'IBM Plex Mono', monospace", color: "#BDBBB0", flex: "0 0 auto", alignSelf: "center" }}>↵</span>
          </div>

          <ParsePreview draft={draft} />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", margin: "26px 0 20px" }}>
          {FILTERS.map(([key, label]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  font: "13px 'IBM Plex Mono', monospace",
                  color: active ? "#26261F" : "#A6A498",
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: "5px",
                  borderBottom: active ? "2px solid #26261F" : "2px solid transparent",
                  paddingBottom: "3px",
                }}
              >
                {label}
                <span style={{ font: "11px 'IBM Plex Mono', monospace", color: active ? "#87867E" : "#BDBBB0" }}>
                  {counts[key] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ font: "12px 'IBM Plex Mono', monospace", color: "#B3423A", marginBottom: "14px" }}>{error}</div>
        )}

        {loaded && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              font: "13px 'IBM Plex Mono', monospace",
              color: "#B0AEA3",
              borderTop: "1px solid #E4E2D8",
            }}
          >
            这里还是空的 — 上面写一句就能归档
          </div>
        )}

        {filtered.map((idea) => (
          <IdeaRow
            key={idea.id}
            idea={idea}
            onCycleStatus={handleCycleStatus}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
          />
        ))}
      </div>

      {showSecretPanel && <AccessSecretPanel onClose={() => setShowSecretPanel(false)} />}
    </div>
  );
}
