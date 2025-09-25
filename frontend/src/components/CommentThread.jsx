import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment, fetchComments, deleteComment } from '../store/slices/commentsSlice.js';

function buildTree(comments) {
  const byId = new Map();
  comments.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots = [];
  comments.forEach((c) => {
    if (c.parent_id) {
      const parent = byId.get(c.parent_id);
      if (parent) parent.children.push(byId.get(c.id));
    } else {
      roots.push(byId.get(c.id));
    }
  });
  return roots;
}

function Node({ node, onReply, onDelete, canDelete }) {
  return (
    <div className="pl-4 border-l">
      <div className="py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{node.display_name || node.username}</div>
          {canDelete && (
            <button 
              onClick={() => onDelete(node.id)}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
              title="Delete comment"
            >
              Delete
            </button>
          )}
        </div>
        <div className="whitespace-pre-wrap">{node.content}</div>
        <button className="text-xs text-blue-600" onClick={() => onReply(node.id)}>Reply</button>
      </div>
      {node.children?.map((child) => (
        <Node key={child.id} node={child} onReply={onReply} onDelete={onDelete} canDelete={canDelete} />
      ))}
    </div>
  );
}

export default function CommentThread({ postId }) {
  const dispatch = useDispatch();
  const comments = useSelector((s) => s.comments.byPostId[postId] || []);
  const me = useSelector((s) => s.auth.user);
  const [replyTo, setReplyTo] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => { dispatch(fetchComments(postId)); }, [dispatch, postId]);
  const tree = useMemo(() => buildTree(comments), [comments]);

  async function submit(e) {
    e.preventDefault();
    await dispatch(addComment({ postId, content, parent_id: replyTo })).unwrap();
    setContent('');
    setReplyTo(null);
    dispatch(fetchComments(postId));
  }

  async function handleDelete(commentId) {
    try {
      await dispatch(deleteComment({ commentId, postId })).unwrap();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={submit} className="mb-3">
        {replyTo && <div className="text-xs mb-1">Replying to #{replyTo}</div>}
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-2 py-1" placeholder="Write a comment..." value={content} onChange={(e) => setContent(e.target.value)} />
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
        </div>
      </form>
      {tree.map((node) => (
        <Node 
          key={node.id} 
          node={node} 
          onReply={setReplyTo} 
          onDelete={handleDelete}
          canDelete={me?.id === node.user_id}
        />
      ))}
    </div>
  );
}


