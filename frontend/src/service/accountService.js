// src/service/accountService.js

const BASE_URL = 'https://dhydroquack-backend.onrender.com';

const request = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong.');
  }

  return data;
};

// ─── Personal Info ───────────────────────────────────────
export const updatePersonalInfo = ({ displayName, username }) =>
  request('/api/account/personal-info', 'PUT', { displayName, username });

// ─── Email ───────────────────────────────────────────────
export const changeEmail = async ({ currentEmail, newEmail, sendToNew }) => {
  await Promise.resolve();
  return { success: true, message: 'Email change request prepared.' };
};

export const sendOtp = ({ email }) =>
  request('/api/auth/send-otp', 'POST', { email });

export const verifyOtp = ({ email, otp }) =>
  request('/api/auth/verify-otp', 'POST', { email, otp });

export const verifyEmailOtp = ({ email, otp }) =>
  verifyOtp({ email, otp });

// ─── Phone ───────────────────────────────────────────────
export const changePhone = async ({ phone }) => {
  await Promise.resolve();
  return { success: true, message: 'Phone change request prepared.' };
};

export const verifyPhoneOtp = async ({ phone, otp }) => {
  if (!phone || !otp) {
    throw new Error('Phone number and OTP are required.');
  }

  return { success: true, message: 'Phone verification passed locally.' };
};

// ─── Password ────────────────────────────────────────────
export const changePassword = async ({ email, currentPassword, newPassword }) =>
  request('/api/auth/change-password', 'POST', { email, currentPassword, newPassword });

// ─── Profile Picture ─────────────────────────────────────
export const updateProfilePicture = async (imageUri) => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  });

  const response = await fetch(`${BASE_URL}/account/profile-picture`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
      // 'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile picture.');
  return data;
};

// ─── Get Profile ─────────────────────────────────────────
export const getProfile = () => request('/account/profile', 'GET');

// ─── Logout ──────────────────────────────────────────────
export const logout = () => request('/account/logout', 'POST');