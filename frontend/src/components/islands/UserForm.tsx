import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import MediaPicker from './MediaPicker';

interface UserFormProps {
  userId?: number;
}

export default function UserForm({ userId }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    avatar_id: null as number | null,
    role: 'author' as 'admin' | 'editor' | 'author',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(userId!);
      const user = response.data;
      
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        avatar_id: user.avatar_id,
        role: user.role || 'author',
        status: user.status || 'active',
      });

      if (user.avatar) {
        setSelectedAvatar(user.avatar);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      alert('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (media: any) => {
    setSelectedAvatar(media);
    setFormData(prev => ({ ...prev, avatar_id: media?.id || null }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      alert('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      alert('Email is required');
      return;
    }

    if (!userId && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      setLoading(true);
      const data = { ...formData };
      if (!data.password) delete (data as any).password;
      
      if (userId) {
        await usersApi.update(userId, data);
        alert('User updated successfully');
      } else {
        await usersApi.create(data);
        alert('User created successfully');
        window.location.href = '/users';
      }
    } catch (error: any) {
      console.error('Failed to save user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (loading && userId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!userId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={userId ? 'Leave empty to keep current password' : ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </label>
            {selectedAvatar ? (
              <div className="flex items-start gap-4">
                <img
                  src={selectedAvatar.thumbnail_url || selectedAvatar.url}
                  alt={selectedAvatar.alt_text}
                  className="w-24 h-24 object-cover rounded-full border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">{selectedAvatar.filename}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAvatarSelect(null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Select Avatar
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <a
            href="/users"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : userId ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>

      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleAvatarSelect}
        accept="image"
      />
    </>
  );
}
