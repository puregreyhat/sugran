import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminIndex() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recipes?limit=1000');
      const j = await res.json();
      setRecipes(Array.isArray(j.results) ? j.results : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this recipe?')) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecipes(r => r.filter(x => x.id !== id));
      } else {
        alert('Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sugran — Admin</h1>
          <div className="flex gap-2">
            <Link href="/admin/new" className="px-4 py-2 bg-green-600 text-white rounded">Add Recipe</Link>
            <button onClick={fetchRecipes} className="px-4 py-2 bg-blue-600 text-white rounded">Refresh</button>
          </div>
        </header>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="space-y-3">
            {recipes.map(r => (
              <div key={r.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.cuisine} • {r.ingredients?.length || 0} ingredients</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/api/recipes/${r.id}`} className="px-3 py-1 bg-gray-100 rounded">View JSON</Link>
                  <Link href={`/admin/edit?id=${encodeURIComponent(r.id)}`} className="px-3 py-1 bg-amber-100 rounded">Edit</Link>
                  <button onClick={() => handleDelete(r.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
