import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:4000/api';
const tokenKey = 'twitlite_token';

export const login = createAsyncThunk('auth/login', async ({ usernameOrEmail, password }) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
});

export const register = createAsyncThunk('auth/register', async ({ username, email, password, display_name }) => {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, display_name })
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { getState }) => {
  const token = getState().auth.token;
  if (!token) return null;
  const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to load me');
  return res.json();
});

const slice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem(tokenKey) || null,
    user: null,
    status: 'idle',
    error: null
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(tokenKey);
    }
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
     .addCase(login.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.token = a.payload.token;
        s.user = a.payload.user;
        localStorage.setItem(tokenKey, a.payload.token);
     })
     .addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })
     .addCase(register.fulfilled, (s) => { s.status = 'succeeded'; })
     .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
     .addCase(register.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; });
    b.addCase(fetchMe.fulfilled, (s, a) => { if (a.payload) s.user = a.payload; });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;


