import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function InputRow({ idx, ing, onChange, onRemove }) {
  return (
    <div className="flex gap-2 mb-2">
      <input value={ing.name} onChange={e => onChange(idx, { ...ing, name: e.target.value })} placeholder="name" className="flex-1 p-2 border rounded" />
      <input value={ing.amount || ''} onChange={e => onChange(idx, { ...ing, amount: e.target.value })} placeholder="amount" className="w-24 p-2 border rounded" />
      <input value={ing.unit || ''} onChange={e => onChange(idx, { ...ing, unit: e.target.value })} placeholder="unit" className="w-24 p-2 border rounded" />
      <button type="button" onClick={() => onRemove(idx)} className="px-3 py-1 bg-red-500 text-white rounded">×</button>
    </div>
  );
}

export default function EditRecipe() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('not found');
        const j = await res.json();
        setRecipe(j.recipe || null);
      } catch (e) {
        console.error(e);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateIngredient = (i, val) => {
    setRecipe(r => ({ ...r, ingredients: r.ingredients.map((p, idx) => idx === i ? val : p) }));
  };

  const removeIngredient = (i) => setRecipe(r => ({ ...r, ingredients: r.ingredients.filter((_, idx) => idx !== i) }));
  const addIngredient = () => setRecipe(r => ({ ...r, ingredients: [...(r.ingredients||[]), { name: '', amount: '', unit: '' }] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipe) return;
    setSaving(true);
    try {
      const body = {
        name: recipe.name,
        cuisine: recipe.cuisine,
        image_url: recipe.image_url || null,
        servings: recipe.servings,
        is_veg: typeof recipe.is_veg !== 'undefined' ? recipe.is_veg : undefined,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tags: recipe.tags || [],
      }; 
      const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json();
        alert('Failed: ' + (j.error || res.statusText));
      } else {
        router.push('/admin');
      }
    } catch (e) {
      console.error(e);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen p-8">Loading…</div>;
  if (!recipe) return <div className="min-h-screen p-8">Recipe not found</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Edit Recipe</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm text-gray-600">Name</label>
            <input className="w-full p-2 border rounded" value={recipe.name || ''} onChange={e => setRecipe(r => ({ ...r, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-600">Cuisine</label>
              <input className="w-full p-2 border rounded" value={recipe.cuisine || ''} onChange={e => setRecipe(r => ({ ...r, cuisine: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Servings</label>
              <input className="w-full p-2 border rounded" value={recipe.servings || ''} onChange={e => setRecipe(r => ({ ...r, servings: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Diet</label>
              <select className="w-full p-2 border rounded" value={recipe.is_veg === true ? 'veg' : recipe.is_veg === false ? 'non-veg' : (recipe.tags && (recipe.tags.includes('non-veg') ? 'non-veg' : (recipe.tags.includes('veg') || recipe.tags.includes('vegetarian') ? 'veg' : '')))} onChange={e => setRecipe(r => ({ ...r, is_veg: e.target.value === 'veg' ? true : e.target.value === 'non-veg' ? false : undefined }))}>
                <option value="">Not specified</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>
          </div> 

          <div className="mb-3">
            <label className="block text-sm text-gray-600">Ingredients</label>
            {(recipe.ingredients||[]).map((ing, i) => (
              <InputRow key={i} idx={i} ing={ing} onChange={updateIngredient} onRemove={removeIngredient} />
            ))}
            <div className="mt-2">
              <button type="button" onClick={addIngredient} className="px-3 py-1 bg-green-600 text-white rounded">Add Ingredient</button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600">Image URL</label>
            <input className="w-full p-2 border rounded" value={recipe.image_url || ''} onChange={e => setRecipe(r => ({ ...r, image_url: e.target.value }))} placeholder="https://..." />
            {recipe.image_url ? (
              <div className="mt-2">
                <img src={recipe.image_url} alt={recipe.name || 'preview'} className="w-48 h-32 object-cover rounded border" onError={(e)=>{e.target.style.display='none'}} />
              </div>
            ) : null}
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600">Steps (one per line)</label>
            <textarea className="w-full p-2 border rounded" rows={6} value={(recipe.steps || []).join('\n')} onChange={e => setRecipe(r => ({ ...r, steps: e.target.value.split('\n').map(s=>s.trim()).filter(Boolean) }))} />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => router.push('/admin')} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
