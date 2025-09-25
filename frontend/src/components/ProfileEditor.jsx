import { useState } from 'react';

export default function ProfileEditor({ me, onSave }) {
  const [display_name, setDisplayName] = useState(me?.display_name || '');
  const [bio, setBio] = useState(me?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);

  function submit(e) {
    e.preventDefault();
    const form = new FormData();
    form.append('display_name', display_name);
    form.append('bio', bio);
    if (avatar) form.append('avatar', avatar);
    if (cover) form.append('cover', cover);
    onSave(form);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display name</label>
        <input 
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
          value={display_name} 
          onChange={(e) => setDisplayName(e.target.value)} 
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
          rows={3}
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
        />
      </div>

      {/* Avatar and Cover */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar</label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              className="hidden"
              id="avatar-upload"
            />
            <label 
              htmlFor="avatar-upload"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Choose File
            </label>
            <div className="text-xs text-gray-500 mt-1">
              {avatar ? avatar.name : 'No file chosen'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover</label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              className="hidden"
              id="cover-upload"
            />
            <label 
              htmlFor="cover-upload"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Choose File
            </label>
            <div className="text-xs text-gray-500 mt-1">
              {cover ? cover.name : 'No file chosen'}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start">
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save
        </button>
      </div>
    </form>
  );
}


