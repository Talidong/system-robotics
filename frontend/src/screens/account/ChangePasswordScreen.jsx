// src/screens/account/ChangePasswordScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useChangePassword from '../../hooks/account/useChangePassword';
import { getProfile } from '../../service/userStorage';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { loading, error, success, submitPasswordChange, reset } = useChangePassword();

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const finalizeReset = async () => {
        await AsyncStorage.multiRemove(['user', 'user_profile']);
       navigation.getParent().getParent().reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      };

      Alert.alert('Success', 'Password updated successfully. Please sign in again.');
      finalizeReset();
    }
  }, [success, navigation]);

const handleChangePassword = async () => {
  if (!newPassword || !confirmPassword) {
    Alert.alert('Error', 'New password fields are required.');
    return;
  }

  const profile = await getProfile();
  const ok = await submitPasswordChange({
    email: profile.email,
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (ok) {
    await AsyncStorage.multiRemove(['user', 'user_profile']);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.headerRole}>Admin</Text>
            <Text style={styles.headerTitle}>Account Profile</Text>
          </View>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.cardSubtitle}>
            Your password must be at least 8 characters and should include a
            combination of numbers, letters and special characters (!$@%).
          </Text>

          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              placeholder="••••••••"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              placeholder="••••••••"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Re-type new password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="••••••••"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.changeBtn, loading && { opacity: 0.6 }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.changeBtnText}>{loading ? 'Updating...' : 'Change Password'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7e8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 18 },
  headerRole: { fontSize: 11, color: '#666' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  card: {
    backgroundColor: '#fff', margin: 16,
    borderRadius: 12, padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  cardSubtitle: { fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 18 },
  label: { fontSize: 12, color: '#999', marginBottom: 4, marginTop: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 14, color: '#333' },
  changeBtn: {
    backgroundColor: '#3a6b47', marginTop: 24,
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  changeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});