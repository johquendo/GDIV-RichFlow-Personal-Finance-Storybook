import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../ChangeUsername/ChangeUsername.css';

const ChangePassword: React.FC = () => {
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (!newPassword) {
      setError('New password cannot be empty');
      return;
    }

    if (newPassword !== confirmNew) {
      setError('New password and confirmation do not match');
      return;
    }

    try {
      setIsSaving(true);
      await changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="change-username-page">
      <div className="change-username-card">
        <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <h2>Change Password</h2>

        <form className="change-username-form" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <label className="full">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </label>

          <button className="full" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
