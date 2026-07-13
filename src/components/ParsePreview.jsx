import { parseInput } from "../lib/parseIntent";
import { STATUS, fmtDate, daysLeft } from "../lib/statuses";

function buildChips(parsed) {
  const chips = [];
  if (parsed.deadline) {
    const d = daysLeft(parsed.deadline);
    const urgent = d <= 3 && d >= 0;
    const suffix = d < 0 ? "(超期)" : d === 0 ? "(今天)" : `(剩${d}天)`;
    chips.push({ k: "截止", v: fmtDate(parsed.deadline) + suffix, urgent });
  }
  if (parsed.status && parsed.status !== "pending") {
    chips.push({ k: "状态", v: STATUS[parsed.status].label, statusKey: parsed.status });
  }
  parsed.tags.forEach((tg) => chips.push({ k: "标签", v: `#${tg}` }));
  if (parsed.link) chips.push({ k: "链接", v: "已识别" });
  return chips;
}

function chipStyle(c) {
  return {
    font: "11.5px 'IBM Plex Mono', monospace",
    padding: "3px 10px",
    borderRadius: "999px",
    color: c.urgent ? "#B3423A" : c.statusKey ? STATUS[c.statusKey].fg : "#4B4A44",
    background: c.urgent ? "#FBEAE8" : c.statusKey ? STATUS[c.statusKey].bg : "#EDEBE2",
  };
}

export default function ParsePreview({ draft }) {
  const raw = draft.trim();

  if (!raw) {
    return (
      <div
        style={{
          marginTop: "10px",
          font: "12.5px 'IBM Plex Mono', monospace",
          color: "#B8B6AB",
          lineHeight: 1.6,
        }}
      >
        试试:<span style={{ color: "#8A8981" }}>明天</span> ·{" "}
        <span style={{ color: "#8A8981" }}>下周五</span> ·{" "}
        <span style={{ color: "#8A8981" }}>3天后</span> ·{" "}
        <span style={{ color: "#8A8981" }}>#标签</span> ·{" "}
        <span style={{ color: "#8A8981" }}>粘贴链接</span> ·{" "}
        <span style={{ color: "#8A8981" }}>"做完了"/"在做"</span> —— 都会被自动读出来
      </div>
    );
  }

  const parsed = parseInput(raw);
  const chips = buildChips(parsed);
  const title = parsed.title || raw;

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "12px 14px",
        background: "#FCFBF6",
        border: "1px solid #E7E5DB",
        borderRadius: "6px",
        animation: "popIn .16s ease both",
      }}
    >
      <div style={{ font: "11px 'IBM Plex Mono', monospace", letterSpacing: "0.06em", color: "#B0AEA3", marginBottom: "9px" }}>
        识别到
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        <span
          style={{
            font: "600 14px 'Source Serif 4', serif",
            color: "#26261F",
            maxWidth: "340px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        {chips.map((c, i) => (
          <span key={i} style={chipStyle(c)}>
            <span style={{ opacity: 0.6, marginRight: "5px" }}>{c.k}</span>
            {c.v}
          </span>
        ))}
      </div>
    </div>
  );
}
