// src/screens/account/AccountProfileScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, saveProfile, clearAuthSession } from '../../service/userStorage';
import { ACCOUNT_ROUTES } from '../../constants/accountRoutes';
import NotificationBell from '../../components/notifications/NotificationBell';
export default function AccountProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    displayName: '',
    username: '',
    email: '',
    avatar: null,
    role: '',
    team_id: null,
    team_name: '',
  });

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const data = await getProfile();
        setUser(data);
      };
      loadProfile();
    }, [])
  );

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Pumunta sa Settings > Apps > Expo Go > Permissions > Storage at i-allow.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const updated = await saveProfile({ avatar: uri });
        setUser(updated);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.log('ImagePicker Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuthSession();
            navigation.getParent().getParent().reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  // Helper — role badge color
  const getRoleBadgeColor = () => user.role === 'admin' ? '#3a6b47' : '#4a90d9';
  const getRoleLabel = () => user.role === 'admin' ? 'Admin' : 'User';
  const getTeamLabel = () => {
    if (user.role === 'admin') return 'All Teams';
    if (user.team_name) return user.team_name;
    if (user.team_id) return `Team ${user.team_id}`;
    return 'No Team';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoWrapper}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.logo} />
            ) : (
              <Image source={require('../../../assets/icon.png')} style={styles.logo} />
            )}
          </View>
          <View>
            <Text style={styles.headerRole}>{getRoleLabel()}</Text>
            <Text style={styles.headerTitle}>Account Profile</Text>
          </View>
        </View>
      <NotificationBell />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userUsername}>{user.username}</Text>

          {/* Role & Team Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: getRoleBadgeColor() }]}>
              <Ionicons
                name={user.role === 'admin' ? 'shield-checkmark' : 'person'}
                size={12} color="#fff"
              />
              <Text style={styles.badgeText}>{getRoleLabel()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#f0a500' }]}>
              <Ionicons name="people" size={12} color="#fff" />
              <Text style={styles.badgeText}>{getTeamLabel()}</Text>
            </View>
          </View>
        </View>

        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person-outline" size={16} color="#333" />
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate(ACCOUNT_ROUTES.CHANGE_PERSONAL_INFO)}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Display Name</Text>
            <Text style={styles.infoValue}>{user.displayName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={[styles.infoValue, { color: getRoleBadgeColor(), fontWeight: '700' }]}>
              {getRoleLabel()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Team</Text>
            <Text style={styles.infoValue}>{getTeamLabel()}</Text>
          </View>
        </View>

        {/* Account Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="settings-outline" size={16} color="#333" />
            <Text style={styles.cardTitle}>Account Settings</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => navigation.navigate(ACCOUNT_ROUTES.CHANGE_EMAIL)}
          >
            <View>
              <Text style={styles.settingsLabel}>Email Address</Text>
              <Text style={styles.settingsValue}>{user.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => navigation.navigate(ACCOUNT_ROUTES.CHANGE_PASSWORD)}
          >
            <Text style={styles.settingsLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF4BE' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrapper: {
    width: 36, height: 36, borderRadius: 18,
    overflow: 'hidden', backgroundColor: '#ddd',
  },
  logo: { width: 36, height: 36 },
  headerRole: { fontSize: 11, color: '#666' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#4a7c59', justifyContent: 'center', alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#4a7c59', borderRadius: 12, padding: 6,
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#222' },
  userUsername: { fontSize: 13, color: '#888', marginTop: 2 },
  badgeRow: {
    flexDirection: 'row', gap: 8, marginTop: 10,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16,
    marginBottom: 16, borderRadius: 12, padding: 16,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  editBtn: {
    backgroundColor: '#e8f5e9', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 8,
  },
  editBtnText: { fontSize: 12, color: '#4a7c59', fontWeight: '600' },
  infoRow: { marginBottom: 8 },
  infoLabel: { fontSize: 11, color: '#999' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  settingsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  settingsLabel: { fontSize: 14, color: '#333' },
  settingsValue: { fontSize: 12, color: '#888', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#23361A', marginHorizontal: 16,
    marginBottom: 32, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});