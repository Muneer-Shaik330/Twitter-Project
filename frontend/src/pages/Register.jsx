import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice.js';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [display_name, setDisplayName] = useState('');

  async function submit(e) {
    e.preventDefault();
    try { await dispatch(register({ username, email, password, display_name })).unwrap(); nav('/login'); } catch {}
  }

  return (
    <div className="h-screen w-screen fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        {/* Large animated orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-green-500/15 to-teal-500/15 rounded-full blur-2xl animate-pulse delay-4000"></div>
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 rounded-full blur-2xl animate-pulse delay-5000"></div>
        
        {/* Medium floating bubbles */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-white/25 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-white/15 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-7 h-7 bg-white/20 rounded-full animate-bounce delay-1500"></div>
        <div className="absolute top-2/3 left-1/2 w-5 h-5 bg-white/30 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute top-1/2 right-1/5 w-9 h-9 bg-white/18 rounded-full animate-bounce delay-2500"></div>
        
        {/* Small floating particles */}
        <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-3000"></div>
        <div className="absolute top-3/4 right-1/5 w-1.5 h-1.5 bg-white/35 rounded-full animate-bounce delay-3500"></div>
        <div className="absolute bottom-1/5 left-2/3 w-3 h-3 bg-white/25 rounded-full animate-bounce delay-4000"></div>
        <div className="absolute top-1/6 right-2/3 w-2.5 h-2.5 bg-white/30 rounded-full animate-bounce delay-4500"></div>
        <div className="absolute bottom-2/3 right-1/6 w-1 h-1 bg-white/45 rounded-full animate-bounce delay-5000"></div>
        <div className="absolute top-4/5 left-1/6 w-2 h-2 bg-white/35 rounded-full animate-bounce delay-5500"></div>
        
        {/* Moving gradient orbs */}
        <div className="absolute top-1/6 left-1/6 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-ping delay-6000"></div>
        <div className="absolute bottom-1/6 right-1/6 w-24 h-24 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-ping delay-7000"></div>
        <div className="absolute top-2/3 left-1/4 w-28 h-28 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-xl animate-ping delay-8000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl border border-white/20">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="heading-2 text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Join EduConnect
          </h1>
          <p className="text-white/80 text-lg font-body">Create your account</p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <input 
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>

            <div>
              <input 
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm" 
                placeholder="Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div>
              <input 
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm" 
                placeholder="Name" 
                value={display_name} 
                onChange={(e) => setDisplayName(e.target.value)} 
              />
            </div>
            
            <div>
              <input 
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm" 
                placeholder="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 rounded-lg p-2 backdrop-blur-lg">
                <div className="text-red-200 text-xs font-medium">{error}</div>
              </div>
            )}

            <button 
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
              disabled={status==='loading'}
            >
              {status==='loading' ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center pt-1">
              <span className="text-white/70 text-sm">Already have an account? </span>
              <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium text-sm transition-colors">
                Sign in here
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-xs">© 2024 EduConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}


