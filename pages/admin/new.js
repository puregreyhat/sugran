import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function InputRow({ idx, ing, onChange, onRemove }) {
  return (
    <div className="flex gap-2 mb-2">
      <input value={ing.name} onChange={e => onChange(idx, { ...ing, name: e.target.value })} placeholder="name" className="flex-1 p-2 border rounded" />
      <input value={ing.amount} onChange={e => onChange(idx, { ...ing, amount: e.target.value })} placeholder="amount" className="w-24 p-2 border rounded" />
      <input value={ing.unit} onChange={e => onChange(idx, { ...ing, unit: e.target.value })} placeholder="unit" className="w-24 p-2 border rounded" />
      <button onClick={() => onRemove(idx)} className="px-3 py-1 bg-red-500 text-white rounded">×</button>
    </div>
  );
}

export default function NewRecipe() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [steps, setSteps] = useState('');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [splitByDot, setSplitByDot] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateIngredient = (i, val) => {
    setIngredients(prev => prev.map((p, idx) => idx === i ? val : p));
  };
  const removeIngredient = (i) => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const addIngredient = () => setIngredients(prev => [...prev, { name: '', amount: '', unit: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let body;
      if (jsonMode) {
        try {
          body = JSON.parse(jsonText);
        } catch (err) {
          alert('Invalid JSON');
          setLoading(false);
          return;
        }
        // Accept either a top-level recipe object or a wrapper {"recipe": {...}}
        if (body && body.recipe) body = body.recipe;
        if (!body || !body.name) {
          alert('JSON must include a name field');
          setLoading(false);
          return;
        }
        // Normalize some common shapes coming from pasted JSON: support `quantity` -> `amount`
        if (Array.isArray(body.ingredients)) {
          body.ingredients = body.ingredients.map(ing => {
            const amount = ing.amount ?? ing.quantity ?? null;
            const unit = ing.unit ?? ing.units ?? null;
            const note = ing.note ?? ing.notes ?? null;
            return { ...ing, amount, unit, note };
          });
        }
      } else {
        const stepsArr = splitByDot
          ? steps.split('.').map(s => s.trim()).filter(Boolean)
          : steps.split('\n').map(s => s.trim()).filter(Boolean);
        body = {
          name,
          cuisine,
          image_url: imageUrl || null,
          servings: servings ? Number(servings) : null,
          ingredients: ingredients.filter(i => i.name).map(i => ({ name: i.name, amount: i.amount || null, unit: i.unit || null })),
          steps: stepsArr,
        };
      }
      const res = await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        router.push('/admin');
      } else {
        const j = await res.json();
        alert('Failed: ' + (j.error || res.statusText));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to add');
    } finally {
      setLoading(false);
    }
  };

  // No auth required for sugran admin (open by design)

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Add New Recipe</h1>
        <div className="mb-3">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={jsonMode} onChange={e=>setJsonMode(e.target.checked)} /> Paste JSON instead</label>
        </div>
        <form onSubmit={handleSubmit}>
          {jsonMode ? (
            <div className="mb-3">
              <label className="block text-sm text-gray-600">Recipe JSON</label>
              <textarea className="w-full p-2 border rounded" rows={12} value={jsonText} onChange={e=>setJsonText(e.target.value)} />
            </div>
          ) : null}
          {!jsonMode && (
            <>
              <div className="mb-3">
                <label className="block text-sm text-gray-600">Name</label>
                <input className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-gray-600">Cuisine</label>
                  <input className="w-full p-2 border rounded" value={cuisine} onChange={e => setCuisine(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Servings</label>
                  <input className="w-full p-2 border rounded" value={servings} onChange={e => setServings(e.target.value)} />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-600">Image URL</label>
                <input className="w-full p-2 border rounded" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="block text-sm text-gray-600">Ingredients</label>
            {ingredients.map((ing, i) => (
              <InputRow key={i} idx={i} ing={ing} onChange={updateIngredient} onRemove={removeIngredient} />
            ))}
            <div className="mt-2">
              <button type="button" onClick={addIngredient} className="px-3 py-1 bg-green-600 text-white rounded">Add Ingredient</button>
            </div>
          </div>

          {!jsonMode && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600">Steps (one per line)</label>
              <textarea className="w-full p-2 border rounded" rows={6} value={steps} onChange={e => setSteps(e.target.value)} />
              <div className="mt-2 small">
                <label><input type="checkbox" checked={splitByDot} onChange={e => setSplitByDot(e.target.checked)} /> Split steps by dot (.) instead of newline</label>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => router.push('/admin')} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
