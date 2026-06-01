// src/screens/account/ChangePersonalInfoScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { getProfile, saveProfile } from '../../service/userStorage';

export default function ChangePersonalInfoScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await getProfile();
      setDisplayName(data.displayName);
      setUsername(data.username);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!displayName.trim() || !username.trim()) {
      Alert.alert('Error', 'Fields cannot be empty.');
      return;
    }
    await saveProfile({ displayName, username });
    Alert.alert('Success', 'Profile updated!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeText}>Change Profile Picture</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={30}
          />
          <Text style={styles.charCount}>{displayName.length}/30</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            maxLength={30}
          />
          <Text style={styles.charCount}>{username.length}/30</Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
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
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#4a7c59', justifyContent: 'center', alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#4a7c59', borderRadius: 12, padding: 4,
  },
  changeText: { fontSize: 13, color: '#4a7c59', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 12, padding: 16, marginBottom: 16,
  },
  label: { fontSize: 12, color: '#999', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333',
  },
  charCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 32 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: '#4a7c59',
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  cancelText: { color: '#4a7c59', fontWeight: '600' },
  saveBtn: {
    flex: 1, backgroundColor: '#3a6b47',
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
});