// src/service/plantService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://dhydroquack-backend.onrender.com/api';

const TEAM_NAMES = {
  1: 'Team A',
  2: 'Team B',
  3: 'Team C',
  4: 'Team D',
};

export const getTeamName = (teamId) => TEAM_NAMES[teamId] || `Team ${teamId}`;

// Helper — kumuha ng token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const getAllPlants = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/plants`, { headers });
    if (!response.ok) throw new Error('Failed to fetch plants');
    return await response.json();
  } catch (err) {
    console.error('getAllPlants error:', err.message);
    return [];
  }
};

export const getPlantsByTeam = async (teamId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/plants/team/${teamId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch plants by team');
    return await response.json();
  } catch (err) {
    console.error('getPlantsByTeam error:', err.message);
    return [];
  }
};

export const getPlantById = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/plants/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch plant');
    return await response.json();
  } catch (err) {
    console.error('getPlantById error:', err.message);
    return null;
  }
};

export const createPlant = async ({ team_id, user_id, plant_name, date_planted, growth_stage }) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/plants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ team_id, user_id, plant_name, date_planted, growth_stage }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create plant');
    return data;
  } catch (err) {
    console.error('createPlant error:', err.message);
    throw err;
  }
};

// Ng ganito — idagdag ang image_url
export const updatePlant = async (id, { team_id, plant_name, date_planted, growth_stage, image_url }) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/plants/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ team_id, plant_name, date_planted, growth_stage, image_url }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update plant');
    return data;
  } catch (err) {
    console.error('updatePlant error:', err.message);
    throw err;
  }
};

export const deletePlant = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/plants/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete plant');
    return await response.json();
  } catch (err) {
    console.error('deletePlant error:', err.message);
    throw err;
  }
};