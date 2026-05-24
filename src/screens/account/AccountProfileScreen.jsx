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
import { getProfile, saveProfile } from '../../service/userStorage';
import { ACCOUNT_ROUTES } from '../../constants/accountRoutes';

export default function AccountProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    avatar: null,
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
    // Request permission muna
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    console.log('Permission status:', permissionResult.status); // para makita sa terminal

    if (permissionResult.status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Pumunta sa Settings > Apps > Expo Go > Permissions > Storage at i-allow.'
      );
      return;
    }

    console.log('Opening image picker...'); // para makita kung tumatawag

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    console.log('Result:', result); // para makita ang result

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
      <Text style={styles.headerRole}>Admin</Text>
      <Text style={styles.headerTitle}>Account Profile</Text>
    </View>
  </View>
  <TouchableOpacity>
    <Ionicons name="notifications-outline" size={24} color="#333" />
  </TouchableOpacity>
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
            {/* Camera button — pindutin para pumili ng picture */}
            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userUsername}>{user.username}</Text>
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
            onPress={() => navigation.navigate(ACCOUNT_ROUTES.CHANGE_PHONE)}
          >
            <View>
              <Text style={styles.settingsLabel}>Phone Number</Text>
              <Text style={styles.settingsValue}>{user.phone}</Text>
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

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
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
  width: 36,
  height: 36,
  borderRadius: 18,
  overflow: 'hidden',   // ← ito ang mag-cu-cut ng image para maging circle
  backgroundColor: '#ddd',
},
logo: { 
  width: 36, 
  height: 36, 
},
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