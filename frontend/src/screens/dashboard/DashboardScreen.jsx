// src/screens/dashboard/DashboardScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationBell from '../../components/notifications/NotificationBell';
import { getProfile } from '../../service/userStorage';

const BASE_URL = 'https://dhydroquack-backend.onrender.com/api';
const TEAMS = [1, 2, 3, 4];
const TEAM_NAMES = { 1: 'Team A', 2: 'Team B', 3: 'Team C', 4: 'Team D' };

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  const [totalPlants, setTotalPlants] = useState(0);
  const [activeDevices, setActiveDevices] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineSensors, setOnlineSensors] = useState(0);
  const [sensorStatus, setSensorStatus] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadAll();
      const loadAvatar = async () => {
        const profile = await getProfile();
        setUserAvatar(profile?.avatar || null);
      };
      loadAvatar();
    }, [])
  );

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadUser(), loadPlants(), loadDevices(), loadSensorStatus()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPlants(), loadDevices(), loadSensorStatus()]);
    setRefreshing(false);
  };

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      setUserRole(user.role || 'user');
      setDisplayName(user.full_name || user.displayName || '');
    }
  };

  const loadPlants = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_URL}/plants`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setTotalPlants(data.length);
    } catch (err) {
      console.error('loadPlants:', err.message);
    }
  };

  const loadDevices = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_URL}/devices`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setTotalDevices(data.length);
      setActiveDevices(data.filter(d => d.status === 1).length);
    } catch (err) {
      console.error('loadDevices:', err.message);
    }
  };

  const loadSensorStatus = async () => {
    try {
      const statuses = {};
      let onlineCount = 0;

      await Promise.all(
        TEAMS.map(async (teamId) => {
          try {
            const res = await fetch(`${BASE_URL}/sensors/latest?team_id=${teamId}`);
            if (!res.ok) {
              statuses[teamId] = 'offline';
              return;
            }
            const data = await res.json();
            const lastTime = new Date(data.timestamp);
            const diffMinutes = (Date.now() - lastTime.getTime()) / (1000 * 60);
            const isOnline = diffMinutes < 5;
            statuses[teamId] = isOnline ? 'online' : 'offline';
            if (isOnline) onlineCount++;
          } catch {
            statuses[teamId] = 'offline';
          }
        })
      );

      setSensorStatus(statuses);
      setOnlineSensors(onlineCount);
    } catch (err) {
      console.error('loadSensorStatus:', err.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.logo} />
          ) : (
            <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          )}
          <View>
            <Text style={styles.headerRole}>{userRole === 'admin' ? 'Admin' : 'User'}</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#4a7c59" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a7c59']} />
          }
        >
          {/* Greeting */}
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingText}>
              {getGreeting()}{displayName ? `, ${displayName.split(' ')[0]}` : ''}! 👋
            </Text>
            <Text style={styles.greetingSubText}>Here's your hydroponics overview.</Text>
          </View>

          {/* Summary Cards */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.cardsRow}>

            <View style={[styles.summaryCard, { backgroundColor: '#4a7c59' }]}>
              <View style={styles.summaryIconCircle}>
                <Ionicons name="leaf" size={24} color="#4a7c59" />
              </View>
              <Text style={styles.summaryValue}>{totalPlants}</Text>
              <Text style={styles.summaryLabel}>Total Plants</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
              <View style={styles.summaryIconCircle}>
                <Ionicons name="hardware-chip" size={24} color="#2196F3" />
              </View>
              <Text style={styles.summaryValue}>{activeDevices}</Text>
              <Text style={styles.summaryLabel}>Active{'\n'}Devices</Text>
              <Text style={styles.summarySubLabel}>of {totalDevices} total</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: onlineSensors === 4 ? '#4CAF50' : onlineSensors === 0 ? '#E53935' : '#FF9800' }]}>
              <View style={styles.summaryIconCircle}>
                <Ionicons name="wifi" size={24} color={onlineSensors === 4 ? '#4CAF50' : onlineSensors === 0 ? '#E53935' : '#FF9800'} />
              </View>
              <Text style={styles.summaryValue}>{onlineSensors}/4</Text>
              <Text style={styles.summaryLabel}>Online{'\n'}Sensors</Text>
            </View>

          </View>

          {/* Sensor Status per Team */}
          <Text style={styles.sectionTitle}>Sensor Status</Text>
          <View style={styles.sensorGrid}>
            {TEAMS.map((teamId) => {
              const status = sensorStatus[teamId] || 'offline';
              const isOnline = status === 'online';
              return (
                <View key={teamId} style={[styles.sensorCard, isOnline ? styles.sensorCardOnline : styles.sensorCardOffline]}>
                  <View style={[styles.sensorDot, { backgroundColor: isOnline ? '#4CAF50' : '#E53935' }]} />
                  <Text style={styles.sensorTeamName}>{TEAM_NAMES[teamId]}</Text>
                  <Text style={[styles.sensorStatusText, { color: isOnline ? '#4CAF50' : '#E53935' }]}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                  <Ionicons
                    name={isOnline ? 'wifi' : 'wifi-outline'}
                    size={20}
                    color={isOnline ? '#4CAF50' : '#E53935'}
                  />
                </View>
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
  logo: { width: 36, height: 36, borderRadius: 18 },
  headerRole: { fontSize: 11, color: '#666' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: '#888' },
  content: { padding: 16 },
  greetingWrapper: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, marginBottom: 20,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4,
  },
  greetingText: { fontSize: 18, fontWeight: '800', color: '#222', marginBottom: 4 },
  greetingSubText: { fontSize: 13, color: '#888' },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: '#333',
    marginBottom: 12, marginTop: 4,
  },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1, borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 6,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6,
  },
  summaryIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  summaryValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
  summaryLabel: {
    fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  summarySubLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  sensorCard: {
    width: '47%', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 6,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  sensorCardOnline: { backgroundColor: '#f0fff4', borderWidth: 1, borderColor: '#c8e6c9' },
  sensorCardOffline: { backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#ffcdd2' },
  sensorDot: { width: 8, height: 8, borderRadius: 4 },
  sensorTeamName: { fontSize: 15, fontWeight: '700', color: '#333' },
  sensorStatusText: { fontSize: 12, fontWeight: '600' },
});