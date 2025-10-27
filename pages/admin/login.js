import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (res.ok) {
        router.push('/admin');
      } else {
        const j = await res.json();
        alert('Login failed: ' + (j.error || res.statusText));
      }
    } catch (e) {
      console.error(e);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Sugran Admin Login</h1>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="block text-sm text-gray-600">Password</label>
            <input type="password" className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Logging in…' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
