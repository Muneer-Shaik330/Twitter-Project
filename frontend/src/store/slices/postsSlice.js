import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:4000/api';

export const fetchFeed = createAsyncThunk('posts/fetchFeed', async (_, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/feed`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to load feed');
  return res.json();
});

export const createPost = createAsyncThunk('posts/createPost', async ({ content, images }, { getState }) => {
  const token = getState().auth.token;
  const form = new FormData();
  if (content) form.append('content', content);
  (images || []).forEach((file) => form.append('images', file));
  const res = await fetch(`${API}/posts`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
});

export const likePost = createAsyncThunk('posts/likePost', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to like');
  return { postId };
});

export const unlikePost = createAsyncThunk('posts/unlikePost', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/like`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to unlike');
  return { postId };
});

export const repost = createAsyncThunk('posts/repost', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/repost`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to repost');
  return { postId };
});

export const undoRepost = createAsyncThunk('posts/undoRepost', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/repost`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to undo repost');
  return { postId };
});

export const deletePost = createAsyncThunk('posts/deletePost', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to delete');
  return { postId };
});

export const restorePost = createAsyncThunk('posts/restorePost', async (postId, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/restore`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to restore');
  return { postId };
});

export const deleteImage = createAsyncThunk('posts/deleteImage', async ({ postId, imageId }, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/images/${imageId}/delete`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to delete image');
  return { postId, imageId };
});

export const restoreImage = createAsyncThunk('posts/restoreImage', async ({ postId, imageId }, { getState }) => {
  const token = getState().auth.token;
  const res = await fetch(`${API}/posts/${postId}/images/${imageId}/restore`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to restore image');
  return { postId, imageId };
});

const slice = createSlice({
  name: 'posts',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFeed.pending, (s) => { s.status = 'loading'; })
     .addCase(fetchFeed.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
     .addCase(fetchFeed.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })
     .addCase(likePost.fulfilled, (s, a) => {
        const p = s.items.find((x) => x.id === a.payload.postId);
        if (p) { p.liked = 1; p.like_count = (p.like_count || 0) + 1; }
     })
     .addCase(unlikePost.fulfilled, (s, a) => {
        const p = s.items.find((x) => x.id === a.payload.postId);
        if (p) { p.liked = 0; p.like_count = Math.max(0, (p.like_count || 0) - 1); }
     })
     .addCase(repost.fulfilled, (s, a) => {
        const p = s.items.find((x) => x.id === a.payload.postId);
        if (p) { p.reposted = 1; p.repost_count = (p.repost_count || 0) + 1; }
     })
     .addCase(undoRepost.fulfilled, (s, a) => {
        const p = s.items.find((x) => x.id === a.payload.postId);
        if (p) { p.reposted = 0; p.repost_count = Math.max(0, (p.repost_count || 0) - 1); }
     })
     .addCase(deletePost.fulfilled, (s, a) => {
        s.items = s.items.filter((x) => x.id !== a.payload.postId);
     })
     .addCase(restorePost.fulfilled, (s, a) => {
        // Remove from current view (trash) and refresh feed
        s.items = s.items.filter((x) => x.id !== a.payload.postId);
     })
     .addCase(deleteImage.fulfilled, (s, a) => {
        // Remove image from post
        const post = s.items.find((x) => x.id === a.payload.postId);
        if (post && post.images) {
          post.images = post.images.filter((img, index) => index !== a.payload.imageId);
        }
     })
     .addCase(restoreImage.fulfilled, (s, a) => {
        // Image restore would need to refetch the post
        // For now, just log success
        console.log('Image restored successfully');
     });
  }
});

export default slice.reducer;


