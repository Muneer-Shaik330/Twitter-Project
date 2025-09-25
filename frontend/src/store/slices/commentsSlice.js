import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:4000/api';

export const fetchComments = createAsyncThunk('comments/fetch', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/comments/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to load comments');
  return { postId, data: await res.json() };
});

export const addComment = createAsyncThunk('comments/add', async ({ postId, content, parent_id }, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/comments/${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content, parent_id })
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return { postId, ...(await res.json()) };
});

export const deleteComment = createAsyncThunk('comments/delete', async ({ commentId, postId }, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete comment');
  return { commentId, postId };
});

const slice = createSlice({
  name: 'comments',
  initialState: { byPostId: {}, status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchComments.fulfilled, (s, a) => { s.byPostId[a.payload.postId] = a.payload.data; })
     .addCase(addComment.fulfilled, (s, a) => { s.status = 'succeeded'; })
     .addCase(deleteComment.fulfilled, (s, a) => { 
       const comments = s.byPostId[a.payload.postId] || [];
       s.byPostId[a.payload.postId] = comments.filter(c => c.id !== a.payload.commentId);
     });
  }
});

export default slice.reducer;


