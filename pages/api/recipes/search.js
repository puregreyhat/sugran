import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'recipes.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { inventory = [], cuisine, limit = 10 } = req.body || {};
  // inventory: array of product names (strings)
  const all = readDb();

  // simple matching: score recipes by count of ingredients found in inventory
  const scores = all.map(r => {
    const ingNames = (r.ingredients || []).map(i => (i.name || '').toLowerCase());
    const matched = inventory.reduce((acc, it) => acc + (ingNames.includes((it || '').toLowerCase()) ? 1 : 0), 0);
    return { recipe: r, matched };
  });

  let filtered = scores.filter(s => s.matched > 0 || !inventory || inventory.length === 0);
  if (cuisine) filtered = filtered.filter(s => s.recipe.cuisine && s.recipe.cuisine.toLowerCase() === cuisine.toLowerCase());
  filtered.sort((a, b) => b.matched - a.matched);
  const out = filtered.slice(0, limit).map(s => ({ recipe: s.recipe, matched: s.matched }));
  res.status(200).json({ count: out.length, results: out });
}
