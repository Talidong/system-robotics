// src/hooks/account/useChangePassword.js
import { useState } from 'react';
import { changePassword } from '../../service/accountService';

export default function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitPasswordChange = async ({ email, currentPassword, newPassword, confirmPassword }) => {
    setError(null);

    if (!email) {
      setError('User account not found. Please log in again.');
      return false;
    }
    if (!currentPassword) {
      setError('Current password is required.');
      return false;
    }
    if (!newPassword || !confirmPassword) {
      setError('New password fields are required.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!$@%])/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must include letters, numbers, and special characters (!$@%).');
      return false;
    }

    try {
      setLoading(true);
      await changePassword({ email, currentPassword, newPassword });
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to change password.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { loading, error, success, submitPasswordChange, reset };
}