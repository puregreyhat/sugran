const crypto = require('crypto');

const COOKIE_NAME = 'sugran_admin';
const TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function hmacFor(ts, secret) {
  return crypto.createHmac('sha256', String(secret)).update(String(ts)).digest('hex');
}

function makeToken(secret) {
  const ts = Date.now();
  const mac = hmacFor(ts, secret);
  return `${ts}:${mac}`;
}

function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const parts = String(token).split(':');
  if (parts.length !== 2) return false;
  const [tsStr, mac] = parts;
  const ts = Number(tsStr);
  if (Number.isNaN(ts)) return false;
  const expected = hmacFor(ts, secret);
  if (!crypto.timingSafeEqual(Buffer.from(String(mac)), Buffer.from(String(expected)))) return false;
  const ageSec = Math.floor((Date.now() - ts) / 1000);
  return ageSec <= TOKEN_MAX_AGE;
}

function parseCookies(header) {
  if (!header) return {};
  return header.split(';').map(s => s.trim()).reduce((acc, cur) => {
    const [k, ...v] = cur.split('=');
    acc[k] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function cookieString(name, value, opts = {}) {
  const parts = [];
  parts.push(`${name}=${encodeURIComponent(value)}`);
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join('; ');
}

module.exports = { COOKIE_NAME, makeToken, verifyToken, parseCookies, cookieString };
