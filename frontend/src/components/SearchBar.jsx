import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:4000/api';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      const r = await fetch(`${API}/users/search/q?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      setResults(data);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDocClick(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function goTo(id) {
    setOpen(false);
    setQ('');
    nav(`/u/${id}`);
  }

  return (
    <div className="relative" ref={boxRef}>
      <input className="input" placeholder="Search EduConnect" value={q} onChange={(e) => setQ(e.target.value)} />
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border rounded-xl shadow">
          {results.map(r => (
            <button key={r.id} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => goTo(r.id)}>
              {r.avatar_url && <img src={`http://localhost:4000${r.avatar_url}`} className="w-6 h-6 rounded-full" />}
              <div className="text-left">
                <div className="text-sm font-medium">{r.display_name}</div>
                <div className="text-xs text-gray-500">@{r.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


