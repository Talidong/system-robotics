// src/hooks/account/useChangeEmail.js
import { useState } from 'react';
import { changeEmail, verifyEmailOtp } from '../../service/accountService';

export default function useChangeEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitEmailChange = async ({ currentEmail, newEmail, confirmEmail, sendToNew }) => {
    setError(null);

    // Basic validations
    if (!currentEmail || !newEmail || !confirmEmail) {
      setError('All fields are required.');
      return false;
    }
    if (newEmail !== confirmEmail) {
      setError('New email and confirm email do not match.');
      return false;
    }

    try {
      setLoading(true);
      await changeEmail({ currentEmail, newEmail, sendToNew });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to change email.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitEmailOtp = async ({ email, otp }) => {
    setError(null);

    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return false;
    }

    try {
      setLoading(true);
      await verifyEmailOtp({ email, otp });
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { loading, error, success, submitEmailChange, submitEmailOtp, reset };
}