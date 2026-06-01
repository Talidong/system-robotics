// src/constants/plantData.js

export const PLANT_DATA = {
  'mustard greens': {
    commonName: 'Mustard Greens (Mustasa)',
    description:
      'Mustard greens are fast-growing leafy vegetables with a slightly spicy, peppery flavor. They thrive in cool, humid conditions and are rich in vitamins A, C, and K. Commonly used in Filipino dishes like sinigang and pinakbet.',
    wateringSchedule: 'Every 6 hours',
    wateringTimes: ['6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM'],
    harvestDays: 30,
  },
  'water spinach': {
    commonName: 'Water Spinach (Kangkong)',
    description:
      'Water spinach is a fast-growing leafy green vegetable commonly grown in tropical and subtropical countries like the Philippines. It belongs to the same family as sweet potato and morning glory. Best grown in water-rich environments.',
    wateringSchedule: 'Every 6 hours',
    wateringTimes: ['6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM'],
    harvestDays: 21,
  },
  'water cabbage': {
    commonName: 'Water Cabbage (Repolyo)',
    description:
      'Water cabbage is a compact, leafy vegetable with tightly packed leaves. It is high in fiber, vitamin C, and antioxidants. Ideal for hydroponics due to its moderate water and nutrient requirements. Commonly used in soups and stir-fries.',
    wateringSchedule: 'Every 8 hours',
    wateringTimes: ['6:00 AM', '2:00 PM', '10:00 PM'],
    harvestDays: 45,
  },
  'lettuce': {
    commonName: 'Lettuce (Letsugas)',
    description:
      'Lettuce is one of the most popular hydroponics crops due to its shallow root system and fast growth rate. It prefers cool temperatures and moderate nutrient levels. Rich in water content, vitamins A and K, and dietary fiber.',
    wateringSchedule: 'Every 6 hours',
    wateringTimes: ['6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM'],
    harvestDays: 28,
  },
};

// Helper: get plant data by name (case-insensitive)
export const getPlantData = (plantName) => {
  if (!plantName) return null;
  const key = plantName.toLowerCase().trim();
  return PLANT_DATA[key] || null;
};

// Helper: compute days left until harvest
export const getDaysLeft = (datePlanted, harvestDays) => {
  if (!datePlanted || !harvestDays) return null;
  const planted = new Date(datePlanted);
  const harvestDate = new Date(planted);
  harvestDate.setDate(harvestDate.getDate() + harvestDays);
  const today = new Date();
  const diff = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// Helper: compute harvest progress (0-100)
export const getHarvestProgress = (datePlanted, harvestDays) => {
  if (!datePlanted || !harvestDays) return 0;
  const planted = new Date(datePlanted);
  const today = new Date();
  const daysPassed = Math.floor((today - planted) / (1000 * 60 * 60 * 24));
  const progress = Math.min(Math.max((daysPassed / harvestDays) * 100, 0), 100);
  return Math.round(progress);
};