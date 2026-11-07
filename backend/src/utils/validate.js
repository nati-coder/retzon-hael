class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const str = (v, max = 1000) => String(v ?? "").trim().slice(0, max);
const okUrl = v => v === "" || /^https?:\/\/\S+$/i.test(v);
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const toId = v => { const n = Number(v); if (!Number.isInteger(n)) throw new HttpError(400, "Bad id"); return n; };
module.exports = { HttpError, str, okUrl, emailOk, toId };
