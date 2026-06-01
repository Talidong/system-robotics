// src/service/userStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'user_profile';
const AUTH_USER_KEY = 'user';

// Per-user avatar key — naka-save per email
const getAvatarKey = (email) => `avatar_${email}`;

const defaultUser = {
  displayName: '',
  username: '',
  email: '',
  phone: '',
  avatar: null,
  password: '',
  role: '',
  team_id: null,
  team_name: '',
};

const normalizeAuthUser = (authUser) => {
  if (!authUser) return null;
  const parsed = typeof authUser === 'string' ? JSON.parse(authUser) : authUser;
  const email = parsed.email || parsed.user_email || '';
  const displayName = parsed.full_name || parsed.displayName || parsed.name || '';
  const username = parsed.username || email.split('@')[0] || '';

  return {
    displayName,
    username,
    email,
    phone: parsed.phone || parsed.phone_number || '',
    avatar: parsed.avatar ?? null,
    password: parsed.password || '',
    role: parsed.role || '',
    team_id: parsed.team_id || null,
    team_name: parsed.team_name || '',
  };
};

export const getProfile = async () => {
  try {
    const profileData = await AsyncStorage.getItem(USER_KEY);
    const authUserData = await AsyncStorage.getItem(AUTH_USER_KEY);

    const storedProfile = profileData ? JSON.parse(profileData) : {};
    const authUser = normalizeAuthUser(authUserData);

    // Load per-user avatar based on email
    const email = authUser?.email || storedProfile?.email || '';
    let savedAvatar = null;
    if (email) {
      const avatarData = await AsyncStorage.getItem(getAvatarKey(email));
      savedAvatar = avatarData || null;
    }

    return {
      ...defaultUser,
      ...(authUser || {}),
      ...storedProfile,
      // Avatar: per-user saved avatar takes priority
      avatar: savedAvatar || storedProfile?.avatar || authUser?.avatar || null,
    };
  } catch {
    return defaultUser;
  }
};

export const saveProfile = async (updatedData) => {
  try {
    const current = await getProfile();
    const merged = { ...current, ...updatedData };

    // Kung may bagong avatar, i-save separately per email
    if (updatedData.avatar && merged.email) {
      await AsyncStorage.setItem(getAvatarKey(merged.email), updatedData.avatar);
    }

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
};

export const updateStoredUser = async (updatedData) => {
  try {
    const existing = await AsyncStorage.getItem(AUTH_USER_KEY);
    const currentUser = existing ? JSON.parse(existing) : {};
    const mergedUser = { ...currentUser, ...updatedData };

    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mergedUser));
    await saveProfile(mergedUser);

    return mergedUser;
  } catch {
    return null;
  }
};

export const clearAuthSession = async () => {
  try {
    // HINDI nide-delete ang per-user avatar — naka-save per email key
    // Ide-delete lang ang session data
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
};