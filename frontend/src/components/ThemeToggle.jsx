import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/slices/themeSlice.js';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.theme.mode);
  return (
    <button className="px-3 py-1 rounded border" onClick={() => dispatch(toggleTheme())}>
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}


