// src/service/accountService.js

const BASE_URL = 'https://your-api-url.com/api'; // <-- palitan ng actual API mo

// Helper
const request = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`, // <-- lagay mo token kapag may auth na
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
};

// ─── Personal Info ───────────────────────────────────────
export const updatePersonalInfo = ({ displayName, username }) =>
  request('/account/personal-info', 'PUT', { displayName, username });

// ─── Email ───────────────────────────────────────────────
export const changeEmail = ({ currentEmail, newEmail, sendToNew }) =>
  request('/account/change-email', 'POST', { currentEmail, newEmail, sendToNew });

export const verifyEmailOtp = ({ email, otp }) =>
  request('/account/verify-email-otp', 'POST', { email, otp });

// ─── Phone ───────────────────────────────────────────────
export const changePhone = ({ phone }) =>
  request('/account/change-phone', 'POST', { phone });

export const verifyPhoneOtp = ({ phone, otp }) =>
  request('/account/verify-phone-otp', 'POST', { phone, otp });

// ─── Password ────────────────────────────────────────────
export const changePassword = ({ currentPassword, newPassword }) =>
  request('/account/change-password', 'PUT', { currentPassword, newPassword });

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