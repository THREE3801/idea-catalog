import { useEffect, useMemo, useState } from "react";
import { Download, Lock, CornerDownLeft } from "lucide-react";
import { STATUSES, detectUrl } from "./lib/statuses";
import { fetchIdeas, createIdea, updateIdea, deleteIdea } from "./lib/storage";
import { exportAsJson, exportAsText } from "./lib/export";
import IdeaCard from "./components/IdeaCard";
import AccessSecretPanel from "./components/AccessSecretPanel";

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [quickValue, setQuickValue] = useState("");
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

  const handleQuickAdd = async () => {
    const raw = quickValue.trim();
    if (!raw) return;
    const url = detectUrl(raw);
    try {
      const entry = await createIdea({ title: raw, link: url || "" });
      setIdeas((prev) => [entry, ...prev]);
      setQuickValue("");
      setError("");
    } catch (e) {
      setError("保存失败,请重试");
      console.error(e);
    }
  };

  const handleStatusChange = async (id, status) => {
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

  const filtered = ideas.filter((i) => filter === "all" || i.status === filter);

  const counts = useMemo(() => {
    const c = { all: ideas.length };
    STATUSES.forEach((s) => (c[s.key] = ideas.filter((i) => i.status === s.key).length));
    return c;
  }, [ideas]);

  return (
    <div className="min-h-screen w-full" style={{ background: "#EDEEE7" }}>
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div
              className="text-xs tracking-widest uppercase mb-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8A8A82", letterSpacing: "0.12em" }}
            >
              点子索引卡 · Idea Catalog
            </div>
            <h1 className="text-3xl" style={{ fontFamily: "'Source Serif 4', 'Georgia', serif", color: "#1F2937", fontWeight: 600 }}>
              还没验证的想法
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSecretPanel(true)}
              className="p-2 rounded-sm"
              style={{ color: "#9CA3AF" }}
              title="访问口令设置"
            >
              <Lock size={15} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm"
                style={{ background: "#E5E7E4", color: "#1F2937", fontFamily: "'IBM Plex Mono', monospace" }}
                title="导出数据"
              >
                <Download size={14} /> 导出
              </button>
              {showExportMenu && (
                <div
                  className="absolute right-0 mt-1 rounded-sm overflow-hidden z-10"
                  style={{ background: "#fff", border: "1px solid #DEDFD8", minWidth: "120px" }}
                >
                  <button
                    onClick={() => {
                      exportAsJson(ideas);
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1F2937" }}
                  >
                    导出为 JSON
                  </button>
                  <button
                    onClick={() => {
                      exportAsText(ideas);
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1F2937" }}
                  >
                    导出为纯文本
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick input */}
        <div
          className="mb-8 flex items-center gap-2 px-3 py-2.5 rounded-sm"
          style={{ background: "#FFFFFF", border: "1px solid #DEDFD8" }}
        >
          <input
            autoFocus
            value={quickValue}
            onChange={(e) => setQuickValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder="记一条点子,或粘贴链接,回车即存…"
            className="w-full text-base outline-none"
            style={{ fontFamily: "'Source Serif 4', serif", color: "#1F2937", background: "transparent" }}
          />
          <CornerDownLeft size={15} color="#B0B0A8" />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[{ key: "all", label: "全部" }, ...STATUSES].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="px-3 py-1.5 rounded-sm text-xs transition-colors"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: filter === s.key ? "#1F2937" : "transparent",
                color: filter === s.key ? "#F4F4F2" : "#6B7280",
                border: filter === s.key ? "1px solid #1F2937" : "1px solid #DEDFD8",
              }}
            >
              {s.label} · {counts[s.key] || 0}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-xs mb-4" style={{ color: "#B3423A" }}>
            {error}
          </div>
        )}

        {/* Cards */}
        {loaded && filtered.length === 0 && (
          <div
            className="text-center py-16 rounded-sm"
            style={{ border: "1px dashed #DEDFD8", color: "#9CA3AF", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px" }}
          >
            这里还是空的 — 想到点子就在上面记一条
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onSaveEdit={handleSaveEdit}
            />
          ))}
        </div>

        <div className="text-center mt-10 text-xs" style={{ color: "#B0B0A8", fontFamily: "'IBM Plex Mono', monospace" }}>
          数据保存在 Supabase,刷新页面不会丢
        </div>
      </div>

      {showSecretPanel && <AccessSecretPanel onClose={() => setShowSecretPanel(false)} />}
    </div>
  );
}
