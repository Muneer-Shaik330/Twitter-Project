import { Routes, Route, Navigate } from 'react-router-dom';
import Feed from './pages/Feed.jsx';
import Profile from './pages/Profile.jsx';
import PostPage from './pages/PostPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import SearchBar from './components/SearchBar.jsx';
import SidebarLeft from './components/SidebarLeft.jsx';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const token = useSelector((s) => s.auth.token);
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname || '/';
  const authUser = useSelector((s) => s.auth.user);
  const isProfile = path.startsWith('/u/');
  const viewingOwnProfile = isProfile && authUser && path === `/u/${authUser.id}`;
  const pageTitle = isProfile ? (viewingOwnProfile ? (authUser?.display_name || 'Profile') : 'Profile') : path === '/' ? 'Home' : '';
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      {token ? (
        <div className="container flex gap-4">
          <SidebarLeft />
          <main className="flex-1">
            <header className="py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
              <div className="flex items-center gap-3">
                {isProfile && (
                  <button aria-label="Back" onClick={() => navigate(-1)} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">←</button>
                )}
                <h1 className="text-xl font-bold">{pageTitle}</h1>
              </div>
              <div className="flex-1" />
            </header>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/u/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/p/:id" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <aside className="hidden xl:block w-80 shrink-0 py-6 space-y-4 sticky top-4 self-start">
            <div className="card p-4">
              <SearchBar />
            </div>
            <div className="card p-4 flex items-start justify-between">
              <div>
                <div className="font-semibold">Theme</div>
                <div className="text-sm text-gray-500">Switch between light and dark themes</div>
              </div>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}


