import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
  const all = await readDb();
    // support query params: cuisine, q (search term)
    const { cuisine, q, limit } = req.query;
    let out = all;
    if (cuisine) {
      out = out.filter(r => r.cuisine && r.cuisine.toLowerCase() === cuisine.toLowerCase());
    }
    if (q) {
      const term = q.toLowerCase();
      out = out.filter(r => r.name.toLowerCase().includes(term) || (r.ingredients || []).some(i => i.name.toLowerCase().includes(term)));
    }
    if (limit) {
      const n = parseInt(limit, 10);
      if (!isNaN(n)) out = out.slice(0, n);
    }
    return res.status(200).json({ count: out.length, results: out });
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      // Accept wrapper { recipe: { ... } }
      if (body && body.recipe) body = body.recipe;
      if (!body || !body.name) return res.status(400).json({ error: 'name required' });

      // Normalize ingredients shape to { name, amount, unit, note }
      const normalizeIng = (ing) => {
        if (!ing) return null;
        const rawName = ing.name || ing.item || '';
        // remove parenthetical descriptors like "(medium)", "(optional)"
        const cleanedName = rawName.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
        const rawAmount = ing.amount ?? ing.quantity ?? null;
        let amount = rawAmount;
        if (typeof rawAmount === 'string' && rawAmount.trim() !== '') {
          const n = Number(rawAmount);
          if (!isNaN(n)) amount = n; // coerce numeric strings
        }
        const unit = (ing.unit ?? ing.units ?? null) || null;
        const note = ing.note ?? ing.notes ?? null;
        return { name: cleanedName || rawName, amount: amount ?? null, unit, note };
      };

      const all = await readDb();
      const ingredients = Array.isArray(body.ingredients) ? body.ingredients.map(normalizeIng).filter(Boolean) : [];

      const newRecipe = {
        id: uuidv4(),
        name: body.name,
        cuisine: body.cuisine || 'unknown',
        image_url: body.image_url || null,
        ingredients,
        steps: body.steps || [],
        calories: body.calories || null,
        servings: body.servings || null,
        prep_time_minutes: body.prep_time_minutes || null,
        cook_time_minutes: body.cook_time_minutes || null,
        tags: body.tags || [],
        created_at: new Date().toISOString(),
      };
      all.unshift(newRecipe);
      try {
        const ok = await writeDb(all);
        if (!ok) return res.status(500).json({ error: 'failed to write db' });
        return res.status(201).json({ recipe: newRecipe });
      } catch (e) {
        console.error('write error', e);
        return res.status(500).json({ error: e?.message || 'failed to write db' });
      }
    } catch (e) {
      console.error('post handler error', e);
      return res.status(500).json({ error: e?.message || 'server error' });
    }
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).end('Method Not Allowed');
}
