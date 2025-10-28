import { readDb, writeDb } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  const all = await readDb();
  const r = all.find(x => x.id === id);
  if (req.method === 'GET') {
    if (!r) return res.status(404).json({ error: 'not found' });
    return res.status(200).json({ recipe: r });
  }

  if (req.method === 'DELETE') {
    // require admin
    if (!r) return res.status(404).json({ error: 'not found' });
    const remaining = all.filter(x => x.id !== id);
    const ok = await writeDb(remaining);
    if (!ok) return res.status(500).json({ error: 'failed to delete' });
    return res.status(200).json({ deleted: id });
  }

  if (req.method === 'PUT') {
    // require admin
  if (!r) return res.status(404).json({ error: 'not found' });
  let body = req.body || {};
  if (body && body.recipe) body = body.recipe;
    // allowed fields to update
    const allowed = ['name','cuisine','image_url','ingredients','steps','calories','servings','prep_time_minutes','cook_time_minutes','tags'];
    const updated = { ...r };
    // normalize ingredients if present
    const normalizeIng = (ing) => {
      if (!ing) return null;
      const rawName = ing.name || ing.item || '';
      const cleanedName = rawName.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
      const rawAmount = ing.amount ?? ing.quantity ?? null;
      let amount = rawAmount;
      if (typeof rawAmount === 'string' && rawAmount.trim() !== '') {
        const n = Number(rawAmount);
        if (!isNaN(n)) amount = n;
      }
      const unit = (ing.unit ?? ing.units ?? null) || null;
      const note = ing.note ?? ing.notes ?? null;
      return { name: cleanedName || rawName, amount: amount ?? null, unit, note };
    };

    for (const k of allowed) {
      if (typeof body[k] !== 'undefined') {
        if (k === 'ingredients' && Array.isArray(body[k])) {
          updated[k] = body[k].map(normalizeIng).filter(Boolean);
        } else {
          updated[k] = body[k];
        }
      }
    }
    updated.updated_at = new Date().toISOString();
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    all[idx] = updated;
    const ok = await writeDb(all);
    if (!ok) return res.status(500).json({ error: 'failed to write db' });
    return res.status(200).json({ recipe: updated });
  }

    res.setHeader('Allow', 'GET,PUT,DELETE');
  return res.status(405).end('Method Not Allowed');
}
