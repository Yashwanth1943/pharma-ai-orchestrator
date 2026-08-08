import { useState } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { Badge } from '../components/ui/Badge/Badge';
import { Avatar } from '../components/ui/Avatar/Avatar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { User, Lock, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';

export const SystemSettings = () => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileStatus, setProfileStatus] = useState(null); // { type: 'success'|'error', message }
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileStatus({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      await api.put('/auth/profile', { name: profileForm.name });
      setProfileStatus({ type: 'success', message: 'Name updated successfully. Please re-login to see changes.' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus(null);
    try {
      await api.put('/auth/profile', { password: passwordForm.password });
      setPasswordForm({ password: '', confirmPassword: '' });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Manage your profile, credentials, and system preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center text-center p-6 gap-4">
            <Avatar name={user?.name} size="xl" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-3">
                <Badge variant={user?.role === 'Admin' ? 'critical' : 'primary'}>
                  {user?.role}
                </Badge>
              </div>
            </div>
            <div className="w-full pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-green-600 justify-center">
                <CheckCircle size={14} />
                <span className="text-xs font-medium">Account Active</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Name */}
          <Card>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <User size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profile Information</h3>
                <p className="text-xs text-gray-500">Update your display name.</p>
              </div>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Display Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ name: e.target.value })}
                required
              />
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500">Email address</p>
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              </div>
              {profileStatus && (
                <div className={`text-sm px-4 py-2 rounded-lg border ${profileStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {profileStatus.message}
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Name'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-500">Use a strong, unique password.</p>
              </div>
            </div>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                required
                placeholder="Minimum 6 characters"
              />
              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                rightIcon={showConfirm ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirm(!showConfirm)}
                required
                placeholder="Re-enter new password"
              />
              {passwordStatus && (
                <div className={`text-sm px-4 py-2 rounded-lg border ${passwordStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {passwordStatus.message}
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Role Info */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Role & Permissions</h3>
                <p className="text-xs text-gray-500">Your access level is set by the administrator.</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Assigned Role</span>
              <Badge variant={user?.role === 'Admin' ? 'critical' : 'primary'}>
                {user?.role}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              To change your role or permissions, contact your system administrator.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
