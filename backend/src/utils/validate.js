class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const str = (v, max = 1000) => String(v ?? "").trim().slice(0, max);
const okUrl = v => v === "" || /^https?:\/\/\S+$/i.test(v);
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const toId = v => { const n = Number(v); if (!Number.isInteger(n)) throw new HttpError(400, "Bad id"); return n; };
const isoDate = v => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === v;
};
// Accepts a full YouTube link (watch, youtu.be, shorts, live, embed) or a bare 11-character id. Returns the id or "".
const ytId = input => {
  const s = String(input ?? "").trim(), ok = x => /^[\w-]{11}$/.test(x || "") ? x : "";
  if (ok(s)) return s;
  try {
    const u = new URL(s), h = u.hostname.replace(/^(www|m|music)\./, "");
    if (h === "youtu.be") return ok(u.pathname.slice(1).split("/")[0]);
    if (h === "youtube.com" || h === "youtube-nocookie.com") {
      if (u.pathname === "/watch") return ok(u.searchParams.get("v"));
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{11})/);
      return m ? m[2] : "";
    }
  } catch { /* not a URL */ }
  return "";
};
module.exports = { HttpError, str, okUrl, emailOk, toId, isoDate, ytId };
