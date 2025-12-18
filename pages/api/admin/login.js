const { makeToken, cookieString } = require('../../../lib/adminAuth');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { password } = req.body || {};
  const secret = process.env.SUGRAN_ADMIN_PASSWORD;
  if (!secret) return res.status(500).json({ error: 'Admin password not configured' });
  if (!password || String(password) !== String(secret)) return res.status(401).json({ error: 'Unauthorized' });

  const token = makeToken(secret);
  const cookie = cookieString('sugran_admin', token, { maxAge: 30 * 24 * 60 * 60, httpOnly: true, path: '/', sameSite: 'Lax' });
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ ok: true });
}
