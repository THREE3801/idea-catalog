// 移植自设计稿(design_handoff_intent_line)的 parseInput / parseDate 逻辑。
// 从一行自然语言里抽取链接、标签、截止日期、状态,剩余文本作为标题。

const WEEKDAY = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0 };

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseDate(text, today = new Date()) {
  const base = new Date(today);
  base.setHours(0, 0, 0, 0);
  let m;

  if ((m = text.match(/大后天/))) {
    const d = new Date(base);
    d.setDate(d.getDate() + 3);
    return { iso: toISO(d), raw: m[0] };
  }
  if ((m = text.match(/后天/))) {
    const d = new Date(base);
    d.setDate(d.getDate() + 2);
    return { iso: toISO(d), raw: m[0] };
  }
  if ((m = text.match(/明天/))) {
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    return { iso: toISO(d), raw: m[0] };
  }
  if ((m = text.match(/今天/))) {
    return { iso: toISO(base), raw: m[0] };
  }
  if ((m = text.match(/(\d+)\s*天(后|内)/))) {
    const d = new Date(base);
    d.setDate(d.getDate() + parseInt(m[1], 10));
    return { iso: toISO(d), raw: m[0] };
  }
  if ((m = text.match(/(下{1,2})?\s*(周|星期|礼拜)\s*([一二三四五六日天])/))) {
    const dow = WEEKDAY[m[3]];
    const cur = base.getDay();
    let diff = (dow - cur + 7) % 7;
    if (diff === 0) diff = 7;
    if (m[1]) diff += 7 * m[1].length;
    const d = new Date(base);
    d.setDate(d.getDate() + diff);
    return { iso: toISO(d), raw: m[0] };
  }
  if ((m = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?/))) {
    const y = base.getFullYear();
    const d = new Date(y, +m[1] - 1, +m[2]);
    if (d < base) d.setFullYear(y + 1);
    return { iso: toISO(d), raw: m[0] };
  }
  if ((m = text.match(/(?:^|\s)(\d{1,2})\/(\d{1,2})(?=\s|$)/))) {
    const y = base.getFullYear();
    const d = new Date(y, +m[1] - 1, +m[2]);
    if (d < base) d.setFullYear(y + 1);
    return { iso: toISO(d), raw: `${m[1]}/${m[2]}` };
  }
  return null;
}

export function parseInput(text, today = new Date()) {
  let t = ` ${text} `;
  let link = "";
  let status = "";
  let deadline = "";
  const tags = [];

  const urlM = t.match(/(https?:\/\/[^\s]+|(?:www\.)?[\w-]+\.[\w.-]+\/[^\s]*|(?:www\.)[\w.-]+\.[a-z]{2,})/i);
  if (urlM) {
    const u = urlM[0];
    link = /^https?:/i.test(u) ? u : `https://${u}`;
    t = t.replace(u, " ");
  }

  t = t.replace(/#([^\s#]+)/g, (_, g) => {
    tags.push(g);
    return " ";
  });

  const dt = parseDate(t, today);
  if (dt) {
    deadline = dt.iso;
    t = t.replace(dt.raw, " ");
  }

  t = t.replace(/(前|之前|截止|deadline)/gi, " ");

  if (/做完|完成|搞定|done|发布了/i.test(t)) {
    status = "done";
    t = t.replace(/(已)?(做完了?|完成了?|搞定了?|done|发布了)/gi, " ");
  } else if (/在做|进行中|正在|开工/i.test(t)) {
    status = "doing";
    t = t.replace(/(在做|进行中|正在做?|开工)/gi, " ");
  } else if (/放弃|不做了|算了|废弃/i.test(t)) {
    status = "dropped";
    t = t.replace(/(放弃了?|不做了|算了|废弃)/gi, " ");
  } else {
    status = "pending";
  }

  const title = t.replace(/\s+/g, " ").trim();
  return { title, link, status, deadline, tags };
}
