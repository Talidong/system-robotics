// src/hooks/account/useChangeEmail.js
import { useState } from 'react';
import { sendOtp, verifyEmailOtp } from '../../service/accountService';

export default function useChangeEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitEmailChange = async ({ currentEmail, newEmail, confirmEmail, sendToNew }) => {
    setError(null);

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
      if (sendToNew) {
        await sendOtp({ email: newEmail });
      }
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to process email change.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendEmailOtp = async ({ email }) => {
    setError(null);

    try {
      setLoading(true);
      await sendOtp({ email });
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
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

  return { loading, error, success, submitEmailChange, resendEmailOtp, submitEmailOtp, reset };
}