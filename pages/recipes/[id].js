import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RecipePage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('not found');
        const j = await res.json();
        if (!mounted) return;
        setRecipe(j.recipe || null);
      } catch (e) {
        console.error(e);
        setRecipe(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  if (loading) return <div className="min-h-screen p-8">Loading…</div>;
  if (!recipe) return <div className="min-h-screen p-8">Recipe not found</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-64 object-cover rounded mb-4" onError={(e)=>{e.target.style.display='none'}} />
        ) : null}
        <div className="text-sm text-gray-500 mb-3">{recipe.cuisine} • {recipe.servings ? `${recipe.servings} servings` : ''}</div>
        <h3 className="font-semibold">Ingredients</h3>
        <ul className="list-disc pl-5 mb-3">
          {(recipe.ingredients||[]).map((ing,i) => <li key={i}>{ing.amount ? `${ing.amount} ` : ''}{ing.unit ? `${ing.unit} ` : ''}{ing.name}{ing.note ? ` — ${ing.note}` : ''}</li>)}
        </ul>
        <h3 className="font-semibold">Steps</h3>
        <ol className="list-decimal pl-5">
          {(recipe.steps||[]).map((s,i) => <li key={i} className="mb-1">{s}</li>)}
        </ol>
      </div>
    </div>
  );
}
