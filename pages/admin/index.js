import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminIndex() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recipes?limit=1000');
      const j = await res.json();
      setRecipes(Array.isArray(j.results) ? j.results : []);
      setSelected(new Set());
      setSelectAll(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const toggle = (id) => {
    setSelected(s => {
      const copy = new Set(Array.from(s));
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(recipes.map(r => r.id)));
      setSelectAll(true);
    }
  };

  const handleDeleteOne = async (id) => {
    if (!confirm('Delete this recipe?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecipes(r => r.filter(x => x.id !== id));
        setSelected(s => { const c = new Set(Array.from(s)); c.delete(id); return c; });
      } else {
        const j = await res.json().catch(()=>({}));
        alert('Delete failed: ' + (j.error || res.statusText));
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    } finally { setBusy(false); }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return alert('No recipes selected');
    if (!confirm(`Delete ${ids.length} recipes? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/recipes/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      const j = await res.json();
      if (!res.ok) {
        alert('Bulk delete failed: ' + (j.error || res.statusText));
      } else {
        setRecipes(r => r.filter(x => !ids.includes(x.id)));
        setSelected(new Set());
        setSelectAll(false);
      }
    } catch (e) {
      console.error(e);
      alert('Bulk delete failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen p-8 font-sans bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Sugran — Admin</h1>
          <div className="flex gap-3">
            <Link href="/admin/new" className="px-4 py-2 bg-green-600 text-white rounded-md shadow">Add Recipe</Link>
            <button onClick={fetchRecipes} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow">Refresh</button>
            <button onClick={handleBulkDelete} disabled={busy || selected.size===0} className="px-4 py-2 bg-red-600 text-white rounded-md shadow disabled:opacity-50">Delete Selected</button>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4" />
            Select all
          </label>
          <div className="text-sm text-gray-500">{recipes.length} recipes</div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recipes.map(r => (
              <div key={r.id} className="p-4 bg-white rounded-lg shadow flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center h-full">
                  <input aria-label={`select-${r.id}`} type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="h-5 w-5" />
                </div>
                <div className="flex-shrink-0 w-36 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'}} />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg truncate">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.cuisine} • {r.ingredients?.length || 0} ingredients</div>
                  <div className="mt-2 text-sm text-gray-600 truncate" style={{maxWidth: '60ch'}}>{(r.steps||[]).slice(0,2).join(' • ')}</div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <Link href={`/api/recipes/${r.id}`} className="px-3 py-1 bg-gray-100 rounded">JSON</Link>
                  <Link href={`/admin/edit?id=${encodeURIComponent(r.id)}`} className="px-3 py-1 bg-amber-100 rounded">Edit</Link>
                  <button onClick={() => handleDeleteOne(r.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

