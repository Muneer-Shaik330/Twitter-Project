import { useMemo, useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useDispatch } from 'react-redux';
import { createPost, fetchFeed } from '../store/slices/postsSlice.js';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showError, setShowError] = useState(false);
  const panelRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    function onDoc(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowEmoji(false);
    }
    if (showEmoji) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showEmoji]);

  const emojis = useMemo(
    () => (
      '😀😃😄😁😆🥹😂🤣😊🙂🙃😉😍😘😗😙😚🤗🤩🥰😋😛😜🤪😝🫠🤤😴🤧🤒🤕🥵🥶🥳🤠😎🤓🧐😕🙁☹️😮😯😲😳🥺😭😤😠😡🤬🤯😨😰😥😓😵‍💫😵🤐🤫🤭🫢🫣🤥🤔🤨😐😑😶🫥😶‍🌫️😴😪😮‍💨😌😺😸😹😻😼😽🙀😿😾👍👎👏🙌🤝🙏💪🔥✨🌟💯❤️🧡💛💚💙💜🤎🖤🤍💖💘💝💞'.split('')
    ),
    []
  );

  async function submit(e) {
    e.preventDefault();
    // Require text content even if images are attached
    if (!content.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    await dispatch(createPost({ content, images })).unwrap();
    setContent('');
    setImages([]);
    dispatch(fetchFeed());
  }

  return (
    <form onSubmit={submit} className="card p-3 mb-4 relative">
      <textarea 
        className="input w-full resize-none font-body" 
        rows={3} 
        placeholder="What's happening?" 
        value={content} 
        onChange={(e) => {
          setContent(e.target.value);
          if (showError && e.target.value.trim()) {
            setShowError(false);
          }
        }} 
      />
      {showError && (
        <div className="text-red-500 text-sm mt-1 font-medium">
          Tweet text is required
        </div>
      )}
      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex items-center gap-2 relative">
          <input 
            type="file" 
            className="text-sm" 
            accept="image/*" 
            multiple 
            onChange={(e) => {
              setImages(Array.from(e.target.files || []));
              // Keep error shown if there's still no text
              if (showError && content.trim()) setShowError(false);
            }} 
          />
          <button type="button" className="btn-outline px-2 py-1" onClick={() => setShowEmoji((v) => !v)} aria-label="Add emoji">😊</button>
        </div>
        <button className="btn-primary pill">Post</button>
      </div>

      {showEmoji && (
        <div ref={panelRef} className="absolute z-20 mt-2">
          <Picker data={data} onEmojiSelect={(e) => setContent((c) => c + e.native)} theme="light" previewPosition="none" perLine={8} />
        </div>
      )}
    </form>
  );
}


