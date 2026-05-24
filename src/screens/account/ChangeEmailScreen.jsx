// src/screens/account/ChangeEmailScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { ACCOUNT_ROUTES } from '../../constants/accountRoutes';

export default function ChangeEmailScreen({ navigation }) {
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [sendToNew, setSendToNew] = useState(false);

  // sa handleSave ng ChangeEmailScreen
const handleSave = async () => {
  if (!newEmail || !confirmEmail) {
    Alert.alert('Error', 'Please fill all fields.');
    return;
  }
  if (newEmail !== confirmEmail) {
    Alert.alert('Error', 'Emails do not match.');
    return;
  }
  // I-save muna yung new email, tapos mag-navigate sa verification
  navigation.navigate(ACCOUNT_ROUTES.CHANGE_EMAIL_VERIFICATION, { email: newEmail });
};
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Email Address</Text>

          <Text style={styles.label}>Current Email Address</Text>
          <TextInput
            style={styles.input}
            value={currentEmail}
            onChangeText={setCurrentEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>New Email Address</Text>
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="admin@example.gmail.com"
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Confirm New Email</Text>
          <TextInput
            style={styles.input}
            value={confirmEmail}
            onChangeText={setConfirmEmail}
            placeholder="admin@example.gmail.com"
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSendToNew(!sendToNew)}
          >
            <View style={[styles.checkbox, sendToNew && styles.checkboxChecked]}>
              {sendToNew && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Send verification code to new email</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
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
  card: {
    backgroundColor: '#fff', margin: 16,
    borderRadius: 12, padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 12, color: '#999', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1, borderColor: '#4a7c59',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4a7c59' },
  checkboxLabel: { fontSize: 12, color: '#555' },
  btnRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginBottom: 32,
  },
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