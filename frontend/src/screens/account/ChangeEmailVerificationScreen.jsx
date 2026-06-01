// src/screens/account/ChangeEmailVerificationScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import OtpInput from '../../components/account/OtpInput';
import ResendCodeTimer from '../../components/account/ResendCodeTimer';
import { ACCOUNT_ROUTES } from '../../constants/accountRoutes';
import useChangeEmail from '../../hooks/account/useChangeEmail';
import { updateStoredUser } from '../../service/userStorage';

export default function ChangeEmailVerificationScreen({ navigation, route }) {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { loading, error, success, submitEmailOtp, resendEmailOtp, reset } = useChangeEmail();

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (success && isVerifying) {
      const completeFlow = async () => {
        await updateStoredUser({ email });
        navigation.replace(ACCOUNT_ROUTES.CHANGE_EMAIL_SUCCESS, { email });
      };

      completeFlow();
    }
  }, [success, isVerifying, email, navigation]);

  const handleSubmit = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    const ok = await submitEmailOtp({ email, otp });
    if (!ok) {
      setIsVerifying(false);
      return;
    }
  };

  const handleResend = async () => {
    setIsVerifying(false);
    await resendEmailOtp({ email });
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
        <Text style={styles.title}>Verification Code Sent</Text>
        <Text style={styles.subtitle}>A code was sent to</Text>
        <Text style={styles.email}>{email || 'your email'}</Text>

        <OtpInput length={6} onComplete={setOtp} />

        <ResendCodeTimer onResend={handleResend} />

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>{loading ? 'Verifying...' : 'Submit Code'}</Text>
          </TouchableOpacity>
        </View>
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
  subtitle: { fontSize: 13, color: '#666' },
  email: { fontSize: 13, color: '#4a7c59', fontWeight: '600', marginBottom: 32 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: '#4a7c59',
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  cancelText: { color: '#4a7c59', fontWeight: '600' },
  submitBtn: {
    flex: 1, backgroundColor: '#3a6b47',
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600' },
});