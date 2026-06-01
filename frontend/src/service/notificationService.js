// src/service/notificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://dhydroquack-backend.onrender.com/api';

export const getUserId = async () => {
  const raw = await AsyncStorage.getItem('user');
  if (!raw) return null;
  return JSON.parse(raw).user_id || null;
};

export const getUserTeamId = async () => {
  const raw = await AsyncStorage.getItem('user');
  if (!raw) return null;
  return JSON.parse(raw).team_id || null;
};

// Get notifications — optional team_id filter (0 = all)
export const getNotificationsByUser = async (userId, teamId = 0) => {
  try {
    const url = teamId && teamId !== 0
      ? `${BASE_URL}/notifications/user/${userId}?team_id=${teamId}`
      : `${BASE_URL}/notifications/user/${userId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (err) {
    console.error('getNotificationsByUser:', err.message);
    return [];
  }
};

export const getUnreadNotifications = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/notifications/user/${userId}/unread`);
    if (!response.ok) throw new Error('Failed to fetch unread');
    return await response.json();
  } catch (err) {
    console.error('getUnreadNotifications:', err.message);
    return [];
  }
};

export const getUnreadCount = async (userId) => {
  const data = await getUnreadNotifications(userId);
  return data.length;
};

export const markAsRead = async (alertId) => {
  try {
    await fetch(`${BASE_URL}/notifications/${alertId}/read`, { method: 'PUT' });
  } catch (err) {
    console.error('markAsRead:', err.message);
  }
};

export const markAllAsRead = async (userId) => {
  try {
    await fetch(`${BASE_URL}/notifications/user/${userId}/read-all`, { method: 'PUT' });
  } catch (err) {
    console.error('markAllAsRead:', err.message);
  }
};

export const deleteNotification = async (alertId) => {
  try {
    await fetch(`${BASE_URL}/notifications/${alertId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('deleteNotification:', err.message);
  }
};

export const deleteAllNotifications = async (userId) => {
  try {
    await fetch(`${BASE_URL}/notifications/user/${userId}/all`, { method: 'DELETE' });
  } catch (err) {
    console.error('deleteAllNotifications:', err.message);
  }
};