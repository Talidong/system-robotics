// src/service/deviceService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://dhydroquack-backend.onrender.com/api';

const getToken = async () => {
  const raw = await AsyncStorage.getItem('user');
  if (!raw) return null;
  return JSON.parse(raw).token || null;
};


const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getAllDevices = async () => {
  try {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/devices`, { headers });
    if (!response.ok) throw new Error('Failed to fetch devices');
    return await response.json();
  } catch (err) {
    console.error('getAllDevices:', err.message);
    return [];
  }
};

export const getDevicesByTeam = async (teamId) => {
  try {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/devices/team/${teamId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch devices by team');
    return await response.json();
  } catch (err) {
    console.error('getDevicesByTeam:', err.message);
    return [];
  }
};

export const controlDevice = async (deviceId, status) => {
  try {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/devices/${deviceId}/control`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to control device');
    return data;
  } catch (err) {
    console.error('controlDevice:', err.message);
    throw err;
  }
};

export const updateDeviceSchedule = async (deviceId, schedule) => {
  try {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/devices/${deviceId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(schedule),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update schedule');
    return data;
  } catch (err) {
    console.error('updateDeviceSchedule:', err.message);
    throw err;
  }
};