import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';

export default function SidebarLeft() {
  const me = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 lg:w-72 shrink-0 px-4 py-6 gap-6 sticky top-0 h-screen">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 shadow" />
        <div>
          <div className="font-semibold brand-gradient font-display">EduConnect</div>
          <div className="caption">Learn & Share</div>
        </div>
      </div>
      <nav className="grid gap-1">
        <Link to="/" className="nav-link">
          <span className="i-home" /> Home
        </Link>
        <Link to={me ? `/u/${me.id}` : '/login'} className="nav-link">
          <span className="i-user" /> Profile
        </Link>
      </nav>
      <div className="flex-1" />
      {me && (
        <div>
          <div className="p-3 rounded-2xl border shadow-sm flex items-center gap-3 bg-white/70 dark:bg-gray-900/70">
            {me.avatar_url && <img src={`http://localhost:4000${me.avatar_url}`} className="w-10 h-10 rounded-full" />}
            <button className="text-left flex-1" onClick={() => nav(`/u/${me.id}`)}>
              <div className="text-sm font-semibold">{me.display_name}</div>
              <div className="text-xs text-gray-500">@{me.username}</div>
            </button>
            <button className="btn-outline" onClick={() => { dispatch(logout()); nav('/login'); }}>Logout</button>
          </div>
        </div>
      )}
    </aside>
  );
}


