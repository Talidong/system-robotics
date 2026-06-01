
// src/hooks/account/useChangePhone.js
import { useState } from 'react';
import { changePhone, verifyPhoneOtp } from '../../service/accountService';

export default function useChangePhone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitPhoneChange = async ({ phone }) => {
    setError(null);

    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number.');
      return false;
    }

    try {
      setLoading(true);
      await changePhone({ phone });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitPhoneOtp = async ({ phone, otp }) => {
    setError(null);

    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return false;
    }

    try {
      setLoading(true);
      await verifyPhoneOtp({ phone, otp });
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

  return { loading, error, success, submitPhoneChange, submitPhoneOtp, reset };
}