import { readDb, writeDb } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  try {
    let body = req.body;
    if (body && body.payload) body = body.payload;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!ids.length) return res.status(400).json({ error: 'ids required' });

    const all = await readDb();
    const remaining = all.filter(r => !ids.includes(r.id));
    const ok = await writeDb(remaining);
    if (!ok) return res.status(500).json({ error: 'failed to write db' });
    return res.status(200).json({ deleted: ids, remaining: remaining.length });
  } catch (e) {
    console.error('bulk delete error', e);
    return res.status(500).json({ error: e?.message || 'server error' });
  }
}
