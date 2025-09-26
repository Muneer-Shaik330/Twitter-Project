import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileEditor from '../components/ProfileEditor.jsx';
import { restorePost, fetchFeed, updatePost, deletePost } from '../store/slices/postsSlice.js';

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

  async function handleDelete(postId) {
    try {
      await dispatch(deletePost(postId)).unwrap();
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
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
              <EditablePost post={p} onSave={async (content) => {
                const trimmed = (content || '').trim();
                if (!trimmed) return;
                await dispatch(updatePost({ postId: p.id, content: trimmed })).unwrap();
                // reflect immediately in local list
                setPosts((prev) => prev.map(x => x.id === p.id ? { ...x, content: trimmed } : x));
              }} canEdit={isMe} />
              {p.images && p.images.length ? (
                <div className={p.images.length === 1 ? 'mt-2' : 'grid grid-cols-2 gap-2 mt-2'}>
                  {p.images.map((img) => (
                    <div key={img.id || img.url} className="relative group bg-black rounded overflow-hidden">
                      <a href={img.url?.startsWith('http') ? img.url : `http://localhost:4000${img.url}`} target="_blank" rel="noopener noreferrer">
                        <img
                          className="w-full max-h-[600px] object-contain"
                          src={img.url?.startsWith('http') ? img.url : `http://localhost:4000${img.url}`}
                          loading="lazy"
                          alt="Post image"
                        />
                      </a>
                      {/* No delete overlay per request */}
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
                {isMe && !showTrash && (
                  <button className="ml-auto text-red-600 hover:text-red-700 font-medium" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                )}
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

function EditablePost({ post, onSave, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content || '');
  if (!canEdit) return <div className="whitespace-pre-wrap">{post.content}</div>;
  return (
    <div>
      {!editing ? (
        <div className="whitespace-pre-wrap">{post.content}</div>
      ) : (
        <div className="space-y-2">
          <textarea
            className="input w-full resize-none font-body"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-outline px-3 py-1" onClick={() => { setEditing(false); setDraft(post.content || ''); }}>Cancel</button>
            <button className="btn-primary px-3 py-1" onClick={async () => {
              const trimmed = (draft || '').trim();
              if (!trimmed) return;
              await onSave(trimmed);
              setEditing(false);
            }}>Save</button>
          </div>
        </div>
      )}
      {canEdit && !editing && (
        <div className="mt-2 flex justify-end"><button className="text-gray-700 hover:text-indigo-700" onClick={() => setEditing(true)}>Edit</button></div>
      )}
    </div>
  );
}
