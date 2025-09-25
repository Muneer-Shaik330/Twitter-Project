import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../store/slices/postsSlice.js';
import PostComposer from '../components/PostComposer.jsx';
import TwitCard from '../components/TwitCard.jsx';

export default function Feed() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.posts);
  useEffect(() => { dispatch(fetchFeed()); }, [dispatch]);
  return (
    <div>
      <div>
        <PostComposer />
        {status === 'loading' && <div>Loading...</div>}
        {items.map((p) => (<TwitCard key={p.id} post={p} />))}
      </div>
    </div>
  );
}


