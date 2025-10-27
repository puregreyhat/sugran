const { cookieString } = require('../../../lib/adminAuth');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  // Clear cookie
  const cookie = cookieString('sugran_admin', '', { maxAge: 0, httpOnly: true, path: '/', sameSite: 'Lax' });
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ ok: true });
}
