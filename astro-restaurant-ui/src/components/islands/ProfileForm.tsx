import { useEffect, useState } from 'react';
import { authApi, usersApi } from '@/lib/api';
import { setUser } from '@/stores/auth';

interface ProfileState {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  status: 'active' | 'inactive';
  created_at?: string;
}

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const me = await authApi.me();
      setProfile(me as ProfileState);
      setFormData((prev) => ({ ...prev, full_name: me.full_name || '' }));
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Unable to load your profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setMessage(null);

    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Full name is required.' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Password confirmation does not match.' });
      return;
    }

    try {
      setSaving(true);
      const payload: { full_name: string; password?: string } = {
        full_name: formData.full_name.trim(),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const updated = await usersApi.update(profile.id, payload);
      setUser(updated);
      setProfile(updated as ProfileState);
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Unable to update your profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-gold rounded-2xl border border-amber-400/20 p-8 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-400/30 bg-red-500/10 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="glass-gold rounded-2xl border border-amber-400/20 p-6 space-y-5">
        <h2 className="text-xl font-semibold text-amber-100">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-amber-200/80 mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-amber-400/20 bg-white/5 px-4 py-3 text-amber-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200/80 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full rounded-xl border border-amber-400/10 bg-black/20 px-4 py-3 text-amber-100/70 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-amber-200/80 mb-2">Role</label>
            <div className="rounded-xl border border-amber-400/10 bg-black/20 px-4 py-3 text-amber-100/80 capitalize">
              {profile?.role || 'author'}
            </div>
          </div>

          <div>
            <label className="block text-sm text-amber-200/80 mb-2">Status</label>
            <div className="rounded-xl border border-amber-400/10 bg-black/20 px-4 py-3 text-amber-100/80 capitalize">
              {profile?.status || 'active'}
            </div>
          </div>

          <div>
            <label className="block text-sm text-amber-200/80 mb-2">User ID</label>
            <div className="rounded-xl border border-amber-400/10 bg-black/20 px-4 py-3 text-amber-100/80">
              #{profile?.id}
            </div>
          </div>
        </div>
      </section>

      <section className="glass-gold rounded-2xl border border-amber-400/20 p-6 space-y-5">
        <h2 className="text-xl font-semibold text-amber-100">Change Password</h2>
        <p className="text-sm text-amber-200/60">Leave these fields empty if you do not want to change your password.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-amber-200/80 mb-2">New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-amber-400/20 bg-white/5 px-4 py-3 text-amber-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200/80 mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-amber-400/20 bg-white/5 px-4 py-3 text-amber-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="Re-enter the new password"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 font-semibold hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
