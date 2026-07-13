export const STATUS = {
  pending: { label: "待验证", fg: "#A9761D", bg: "#F6EDD6", dot: "#C08A2E" },
  doing: { label: "进行中", fg: "#2D5A6B", bg: "#E3EDF0", dot: "#2D5A6B" },
  done: { label: "已完成", fg: "#3F7A57", bg: "#E6F0E9", dot: "#3F7A57" },
  dropped: { label: "已放弃", fg: "#87867E", bg: "#EDEDE8", dot: "#ABAAA1" },
};

export const ORDER = ["pending", "doing", "done", "dropped"];

export function statusMeta(key) {
  return STATUS[key] || STATUS.pending;
}

export function cycleStatus(key) {
  return ORDER[(ORDER.indexOf(key) + 1) % ORDER.length];
}

export function fmtDate(iso) {
  if (!iso) return "";
  const p = iso.split("-");
  return `${p[0]}/${+p[1]}/${+p[2]}`;
}

export function daysLeft(deadline, today = new Date()) {
  const base = new Date(today);
  base.setHours(0, 0, 0, 0);
  const target = new Date(deadline + "T00:00:00");
  return Math.round((target - base) / 86400000);
}

// 已完成/已放弃的点子显示截止日期本身,不再提示紧迫性;
// 其余状态显示相对天数,临近(<=3天,含超期)高亮为紧急红。
export function deadlineDisplay(idea) {
  if (!idea.deadline) return null;
  if (idea.status === "done" || idea.status === "dropped") {
    return { text: `截止 ${fmtDate(idea.deadline)}`, urgent: false };
  }
  const d = daysLeft(idea.deadline);
  const urgent = d <= 3;
  const text = d < 0 ? `超期${-d}天` : d === 0 ? "今天截止" : `剩${d}天`;
  return { text, urgent };
}
