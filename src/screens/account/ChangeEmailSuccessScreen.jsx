// src/screens/account/ChangeEmailSuccessScreen.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { ACCOUNT_ROUTES } from '../../constants/accountRoutes';
import SuccessCard from '../../components/account/SuccessCard';
import { saveProfile } from '../../service/userStorage';
export default function ChangeEmailSuccessScreen({ navigation, route }) {
  const { email } = route.params || {};



useEffect(() => {
  const save = async () => {
    await saveProfile({ email });
  };
  save();
}, []);

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
        <SuccessCard
          title="Email Update Successful!"
          subtitle="Your account email has been updated to"
          highlight={email}
          buttonLabel="Continue to Dashboard"
          onPress={() => navigation.navigate(ACCOUNT_ROUTES.PROFILE)}
        />
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
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 32, alignItems: 'center',
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#4a7c59', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center' },
  email: { fontSize: 14, color: '#4a7c59', fontWeight: '600', marginTop: 4, marginBottom: 24 },
  dashboardBtn: {
    backgroundColor: '#3a6b47', width: '100%',
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  dashboardText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});