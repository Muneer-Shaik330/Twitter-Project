import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileEditor from '../components/ProfileEditor.jsx';
import { restorePost, fetchFeed, deleteImage } from '../store/slices/postsSlice.js';

const API = 'http://localhost:4000/api';

export default function Profile() {
  const { id } = useParams();
  const token = useSelector((s) => s.auth.token);
  const isMe = useSelector((s) => s.auth.user?.id?.toString() === id);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${API}/users/${id}`).then((r) => r.json()).then(setUser);
    if (token) {
      fetch(`${API}/users/${id}/summary`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setSummary);
      const q = showTrash ? '?include_deleted=1' : '';
      fetch(`${API}/posts/user/${id}${q}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setPosts);
    }
  }, [id, token, showTrash]);

  async function save(form) {
    await fetch(`${API}/users/me`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: form });
    const fresh = await fetch(`${API}/users/${id}`).then((r) => r.json());
    setUser(fresh);
    setEditing(false);
  }

  async function follow() {
    await fetch(`${API}/users/${id}/follow`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const s = await fetch(`${API}/users/${id}/summary`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
    setSummary(s);
  }

  async function unfollow() {
    await fetch(`${API}/users/${id}/follow`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const s = await fetch(`${API}/users/${id}/summary`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
    setSummary(s);
  }

  async function handleRestore(postId) {
    try {
      await dispatch(restorePost(postId)).unwrap();
      // Remove the post from the current trash list
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      // Refresh the feed to show the restored post
      dispatch(fetchFeed());
    } catch (error) {
      console.error('Failed to restore post:', error);
    }
  }

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Cover + Edit Button */}
      <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
        {user.cover_url && (
          <img
            className="w-full h-full object-cover"
            src={user.cover_url.startsWith('http') ? user.cover_url : `http://localhost:4000${user.cover_url}`}
            alt="Cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/30" />
        <div className="absolute top-4 right-4">
          {isMe ? (
            <button className="btn-primary pill" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Close' : 'Edit Profile'}
            </button>
          ) : summary && (
            summary.is_following ?
              <button className="btn-unfollow" onClick={unfollow}>Unfollow</button> :
              <button className="btn-primary pill" onClick={follow}>Follow</button>
          )}
        </div>
      </div>

     {/* Avatar + Info */}
<div className="relative">
  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
    {user.avatar_url && (
      <img
        className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
        src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:4000${user.avatar_url}`}
        alt="Avatar"
      />
    )}
  </div>
</div>

<div className="pt-20 flex flex-col items-center text-center">
        <div className="heading-3">{user.display_name}</div>
        <div className="body-small">@{user.username}</div>
  {user.bio && (
        <p className="whitespace-pre-wrap mt-2 body-medium max-w-xl">
          {user.bio}
        </p>
  )}
  {summary && (
        <div className="flex justify-center gap-8 body-small mt-4">
          <div><span className="font-semibold">{summary.following}</span> Following</div>
          <div><span className="font-semibold">{summary.followers}</span> Followers</div>
        </div>
  )}
</div>


      {isMe && editing && (
        <div className="card p-4"><ProfileEditor me={user} onSave={save} /></div>
      )}

      {/* Tabs */}
      <div className="mt-2 max-w-2xl mx-auto">
        <div className="flex items-center gap-6 border-b px-2">
          <button
            className={`py-3 ${!showTrash ? 'border-b-2 border-indigo-600 font-medium text-indigo-700' : ''}`}
            onClick={() => setShowTrash(false)}
          >
            Tweets
          </button>
          {isMe && (
            <button
              className={`py-3 ${showTrash ? 'border-b-2 border-indigo-600 font-medium text-indigo-700' : ''}`}
              onClick={() => setShowTrash(true)}
            >
              Trash
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          {posts.map((p) => (
            <div key={p.id} className="card p-3">
              <div className="font-semibold mb-2">{p.display_name || p.username}</div>
              <div className="whitespace-pre-wrap">{p.content}</div>
              {p.images && p.images.length ? (
                <div className={p.images.length === 1 ? 'mt-2' : 'grid grid-cols-2 gap-2 mt-2'}>
                  {p.images.map((url, index) => (
                    <div key={url} className="relative group">
                      <img
                        className="rounded w-full object-cover max-h-72"
                        src={url.startsWith('http') ? url : `http://localhost:4000${url}`}
                        alt="Post"
                      />
                      {isMe && (
                        <button 
                          onClick={() => dispatch(deleteImage({ postId: p.id, imageId: index }))}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex gap-6 mt-3 text-sm items-center">
                <button className="text-gray-600 hover:text-indigo-600" onClick={() => setSummary({ ...summary })}>
                  Comment ({p.comment_count || 0})
                </button>
                <button className="text-gray-600 hover:text-indigo-600">
                  Retweet {p.repost_count ? `(${p.repost_count})` : ''}
                </button>
                <span className="text-gray-600">Like ({p.like_count || 0})</span>
                {showTrash && isMe && (
                  <button className="ml-auto text-green-600 hover:text-green-700 font-medium" onClick={() => handleRestore(p.id)}>
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
