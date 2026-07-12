export const STATUSES = [
  { key: "pending", label: "待验证", color: "#C08A2E", bg: "#FBF3E4" },
  { key: "doing", label: "进行中", color: "#2D5A6B", bg: "#E9F1F3" },
  { key: "dropped", label: "已放弃", color: "#9CA3AF", bg: "#F1F1EF" },
  { key: "done", label: "已完成", color: "#3F7A57", bg: "#E9F3EC" },
];

export function statusMeta(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function deadlineLabel(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return null;
  if (d < 0) return { text: `已超期 ${Math.abs(d)} 天`, urgent: true };
  if (d === 0) return { text: "今天截止", urgent: true };
  if (d <= 3) return { text: `剩 ${d} 天`, urgent: true };
  return { text: `剩 ${d} 天`, urgent: false };
}

const URL_RE = /^(https?:\/\/|www\.)\S+$/i;

export function detectUrl(text) {
  const trimmed = text.trim();
  if (!URL_RE.test(trimmed)) return null;
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}
