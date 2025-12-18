import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/recipes?limit=50');
        const j = await res.json();
        if (!mounted) return;
        setRecipes(Array.isArray(j.results) ? j.results : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sugran</h1>
          <div>
            <Link href="/admin" className="px-3 py-1 bg-amber-100 rounded">Admin</Link>
          </div>
        </header>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recipes.map(r => (
              <article key={r.id} className="p-4 bg-white rounded shadow flex gap-4 items-center">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} className="w-24 h-16 object-cover rounded border" onError={(e)=>{e.target.style.display='none'}} />
                ) : (
                  <div className="w-24 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">No image</div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg"><Link href={`/recipes/${encodeURIComponent(r.id)}`}>{r.name}</Link></h2>
                  <div className="text-sm text-gray-500">{r.cuisine} • {r.ingredients?.length || 0} ingredients</div>
                </div>
                <div>
                  <Link href={`/api/recipes/${r.id}`} className="px-3 py-1 bg-gray-100 rounded">JSON</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
