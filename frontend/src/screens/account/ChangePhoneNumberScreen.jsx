// src/screens/account/ChangePhoneNumberScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { ACCOUNT_ROUTES } from '../../constants/accountRoutes';

export default function ChangePhoneNumberScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [countryCode] = useState('+63');

  const handleGetCode = () => {
    navigation.navigate(ACCOUNT_ROUTES.CHANGE_PHONE_VERIFICATION, {
      phone: `${countryCode}${phone}`,
    });
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

      <View style={styles.content}>
        <Text style={styles.title}>Change Phone Number</Text>
        <Text style={styles.subtitle}>
          A text message will be sent to you{'\n'}to verify your phone number.
        </Text>

        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>{countryCode} ▾</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="0123456789"
            placeholderTextColor="#bbb"
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        <TouchableOpacity style={styles.getCodeBtn} onPress={handleGetCode}>
          <Text style={styles.getCodeText}>Get Verification Code</Text>
        </TouchableOpacity>
      </View>
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
  content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 32 },
  phoneRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 24 },
  countryCode: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: '#fff', justifyContent: 'center',
  },
  countryCodeText: { fontSize: 14, color: '#333' },
  phoneInput: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14,
    color: '#333', backgroundColor: '#fff',
  },
  getCodeBtn: {
    backgroundColor: '#3a6b47', width: '100%',
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  getCodeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});