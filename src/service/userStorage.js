// src/service/userStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'user_profile';

// Default data
const defaultUser = {
  displayName: 'Reinier Prince Amar ',
  username: 'admin_user',
  email: 'admin@talidong.gmail.com',
  phone: '09123456789',
  avatar: null,
};
  
// GET profile
export const getProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : defaultUser;
  } catch {
    return defaultUser;
  }
};

// SAVE profile
export const saveProfile = async (updatedData) => {
  try {
    const current = await getProfile();
    const merged = { ...current, ...updatedData };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
};