import { useDispatch } from 'react-redux';
import { likePost, unlikePost, repost, undoRepost, deletePost, deleteImage } from '../store/slices/postsSlice.js';
import { useSelector } from 'react-redux';
import CommentThread from './CommentThread.jsx';
import { useState } from 'react';

export default function TwitCard({ post }) {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(false);
  const me = useSelector((s) => s.auth.user);
  return (
    <div className="card card-hover p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        {post.avatar_url && <img src={`http://localhost:4000${post.avatar_url}`} alt="avatar" className="w-8 h-8 rounded-full" />}
        <div className="font-semibold">{post.display_name || post.username}</div>
        <div className="text-gray-500 text-sm">@{post.username}</div>
      </div>
      <div className="whitespace-pre-wrap">{post.content}</div>
      {post.images && post.images.length ? (
        <div className={post.images.length === 1 ? 'mt-2' : 'grid grid-cols-2 gap-2 mt-2'}>
          {post.images.map((url, index) => (
            <div key={url} className="relative group">
              <img className="rounded w-full object-cover max-h-72" src={url.startsWith('http') ? url : `http://localhost:4000${url}`} />
              {me?.id === post.user_id && (
                <button 
                  onClick={() => dispatch(deleteImage({ postId: post.id, imageId: index }))}
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
          <button onClick={() => dispatch(deletePost(post.id))} className="text-red-600 hover:text-red-700 ml-auto">Delete</button>
        )}
      </div>
      {showComments && <CommentThread postId={post.id} />}
    </div>
  );
}


