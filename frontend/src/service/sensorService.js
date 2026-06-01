// src/service/sensorService.js

const BASE_URL = 'https://dhydroquack-backend.onrender.com/api';

// ─── Limits ──────────────────────────────────────────────
export const SENSOR_LIMITS = {
  waterLevel:  { low: 20,  high: 80  },
  temperature: { low: 18,  high: 32  },
  humidity:    { low: 40,  high: 80  },
  phLevel:     { low: 5.5, high: 7.0 },
  nutrient:    { low: 800, high: 1500 },
};

// ─── Config ───────────────────────────────────────────────
export const SENSOR_CONFIG = {
  waterLevel:  { label: 'Water Level',  unit: '%',   color: '#2196F3' },
  temperature: { label: 'Temperature',  unit: '°C',  color: '#FF5722' },
  humidity:    { label: 'Humidity',     unit: '%',   color: '#00BCD4' },
  phLevel:     { label: 'pH Level',     unit: 'pH',  color: '#9C27B0' },
  nutrient:    { label: 'Nutrient',     unit: 'ppm', color: '#4CAF50' },
};

// ─── GET latest reading by team ───────────────────────────
export const getCurrentReadings = async (teamId) => {
  try {
    const response = await fetch(`${BASE_URL}/sensors/latest?team_id=${teamId}`);
    if (!response.ok) throw new Error('Failed to fetch latest readings');
    const data = await response.json();
    return {
      waterLevel:  parseFloat(data.waterLevel  ?? 0),
      temperature: parseFloat(data.temperature ?? 0),
      humidity:    parseFloat(data.humidity     ?? 0),
      phLevel:     parseFloat(data.phLevel      ?? 0),
      nutrient:    parseFloat(data.nutrient     ?? 0),
    };
  } catch (error) {
    console.log('getCurrentReadings error:', error.message);
    return null;
  }
};

// ─── GET historical data by team ─────────────────────────
export const getHistoricalData = async (teamId, limit = 7) => {
  try {
    const response = await fetch(`${BASE_URL}/sensors/history?team_id=${teamId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('getHistoricalData error:', error.message);
    return null;
  }
};

// ─── Status checker ───────────────────────────────────────
export const getSensorStatus = (key, value) => {
  const limit = SENSOR_LIMITS[key];
  if (value < limit.low)  return { label: key === 'phLevel' ? 'Abnormal' : 'Low',       color: '#F44336' };
  if (value > limit.high) return { label: key === 'phLevel' ? 'Abnormal' : 'High',      color: '#FF9800' };
  return                         { label: key === 'nutrient' ? 'Sufficient' : 'Normal',  color: '#4CAF50' };
};