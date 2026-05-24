// src/service/sensorService.js

// ─── Limits para sa status indicators ────────────────────
export const SENSOR_LIMITS = {
  waterLevel:  { low: 20,  high: 80  },  // percentage
  temperature: { low: 18,  high: 32  },  // celsius
  humidity:    { low: 40,  high: 80  },  // percentage
  phLevel:     { low: 5.5, high: 7.0 },  // pH
  nutrient:    { low: 800, high: 1500 }, // PPM
};

// ─── Labels para sa display ──────────────────────────────
export const SENSOR_CONFIG = {
  waterLevel:  { label: 'Water Level',  unit: '%',   color: '#2196F3' },
  temperature: { label: 'Temperature',  unit: '°C',  color: '#FF5722' },
  humidity:    { label: 'Humidity',     unit: '%',   color: '#00BCD4' },
  phLevel:     { label: 'pH Level',     unit: 'pH',  color: '#9C27B0' },
  nutrient:    { label: 'Nutrient',     unit: 'ppm', color: '#4CAF50' },
};

// ─── Generate random value within range ──────────────────
const randomBetween = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(1));

// ─── Generate dummy current readings ─────────────────────
export const getCurrentReadings = () => ({
  waterLevel:  randomBetween(15, 90),
  temperature: randomBetween(15, 35),
  humidity:    randomBetween(35, 85),
  phLevel:     randomBetween(5.0, 7.5),
  nutrient:    randomBetween(700, 1600),
});

// ─── Generate dummy historical data (last 7 readings) ────
export const getHistoricalData = () => {
  const labels = ['12pm', '2pm', '4pm', '6pm', '8pm', '10pm', 'Now'];
  return {
    labels,
    waterLevel:  labels.map(() => randomBetween(15, 90)),
    temperature: labels.map(() => randomBetween(15, 35)),
    humidity:    labels.map(() => randomBetween(35, 85)),
    phLevel:     labels.map(() => randomBetween(5.0, 7.5)),
    nutrient:    labels.map(() => randomBetween(700, 1600)),
  };
};

// ─── Get status ng isang sensor ──────────────────────────
export const getSensorStatus = (key, value) => {
  const limit = SENSOR_LIMITS[key];
  if (value < limit.low)  return { label: key === 'phLevel' ? 'Abnormal' : 'Low',      color: '#F44336' };
  if (value > limit.high) return { label: key === 'phLevel' ? 'Abnormal' : 'High',     color: '#FF9800' };
  return                         { label: key === 'nutrient' ? 'Sufficient' : 'Normal', color: '#4CAF50' };
};