const { COOKIE_NAME, verifyToken, parseCookies } = require('../../../lib/adminAuth');

export default function handler(req, res) {
  const secret = process.env.SUGRAN_ADMIN_PASSWORD;
  if (!secret) return res.status(500).json({ error: 'Admin password not configured' });
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME] || cookies['sugran_admin'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const ok = verifyToken(token, secret);
  if (!ok) return res.status(401).json({ error: 'Unauthorized' });
  return res.status(200).json({ ok: true });
}
