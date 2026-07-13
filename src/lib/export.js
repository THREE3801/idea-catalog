import { STATUS } from "./statuses";

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAsJson(ideas) {
  const content = JSON.stringify(ideas, null, 2);
  downloadFile(`idea-catalog-${timestamp()}.json`, content, "application/json");
}

export function exportAsText(ideas) {
  const lines = ideas.map((idea) => {
    const parts = [
      `#${String(idea.num).padStart(3, "0")} ${idea.title}`,
      `状态: ${STATUS[idea.status]?.label || idea.status}`,
      `创建时间: ${new Date(idea.createdAt).toLocaleString("zh-CN")}`,
    ];
    if (idea.deadline) parts.push(`截止时间: ${idea.deadline}`);
    if (idea.link) parts.push(`链接: ${idea.link}`);
    if (idea.tags && idea.tags.length) parts.push(`标签: ${idea.tags.map((t) => `#${t}`).join(" ")}`);
    if (idea.note) parts.push(`备注: ${idea.note}`);
    return parts.join("\n");
  });
  downloadFile(`idea-catalog-${timestamp()}.txt`, lines.join("\n\n---\n\n"), "text/plain");
}
