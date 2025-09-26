import { useDispatch } from 'react-redux';
import { likePost, unlikePost, repost, undoRepost, deletePost, updatePost } from '../store/slices/postsSlice.js';
import { useSelector } from 'react-redux';
import CommentThread from './CommentThread.jsx';
import { useState } from 'react';

export default function TwitCard({ post }) {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content || '');
  const me = useSelector((s) => s.auth.user);
  return (
    <div className="card card-hover p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        {post.avatar_url && <img src={`http://localhost:4000${post.avatar_url}`} alt="avatar" className="w-8 h-8 rounded-full" />}
        <div className="font-semibold">{post.display_name || post.username}</div>
        <div className="text-gray-500 text-sm">@{post.username}</div>
      </div>
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
              await dispatch(updatePost({ postId: post.id, content: trimmed })).unwrap();
              setEditing(false);
            }}>Save</button>
          </div>
        </div>
      )}
      {post.images && post.images.length ? (
        <div className={post.images.length === 1 ? 'mt-2' : 'grid grid-cols-2 gap-2 mt-2'}>
          {post.images.map((img) => (
            <div key={img.id || img.url} className="relative group bg-black rounded overflow-hidden">
              <a href={img.url?.startsWith('http') ? img.url : `http://localhost:4000${img.url}`} target="_blank" rel="noopener noreferrer">
                <img
                  className="w-full max-h-[600px] object-contain"
                  src={img.url?.startsWith('http') ? img.url : `http://localhost:4000${img.url}`}
                  loading="lazy"
                  alt="Post image"
                />
              </a>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex gap-6 mt-3 text-sm items-center">
        <button onClick={() => setShowComments((v) => !v)} className="text-gray-600 hover:text-indigo-600">
          Comment ({post.comment_count || 0})
        </button>
        <button className="text-gray-600 hover:text-indigo-600" onClick={() => dispatch(post.reposted ? undoRepost(post.id) : repost(post.id))}>
          {post.reposted ? 'Undo Retweet' : 'Retweet'} {post.repost_count ? `(${post.repost_count})` : ''}
        </button>
        <button onClick={() => dispatch(post.liked ? unlikePost(post.id) : likePost(post.id))} className="text-gray-600 hover:text-indigo-600">
          {post.liked ? 'Unlike' : 'Like'} ({post.like_count || 0})
        </button>
        {me?.id === post.user_id && (
          <div className="ml-auto flex items-center gap-4">
            <button onClick={() => setEditing((v) => !v)} className="text-gray-700 hover:text-indigo-700">{editing ? 'Cancel' : 'Edit'}</button>
            <button onClick={() => dispatch(deletePost(post.id))} className="text-red-600 hover:text-red-700">Delete</button>
          </div>
        )}
      </div>
      {showComments && <CommentThread postId={post.id} />}
    </div>
  );
}


