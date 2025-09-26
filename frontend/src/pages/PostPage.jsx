import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CommentThread from '../components/CommentThread.jsx';

const API = 'http://localhost:4000/api';

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    // Simplified: load from feed endpoint in a real app or create a /posts/:id endpoint
    fetch(`${API}/posts/feed`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then((r) => r.json())
      .then((list) => setPost(list.find((p) => p.id.toString() === id)));
  }, [id, token]);

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <div className="border rounded p-3 mb-4">
        <div className="text-xl font-semibold mb-2">{post.display_name || post.username}</div>
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
      <CommentThread postId={post.id} />
    </div>
  );
}


