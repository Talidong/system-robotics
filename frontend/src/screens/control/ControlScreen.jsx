// src/screens/control/ControlScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Switch, Modal, TextInput, Alert, ActivityIndicator,
  RefreshControl, Dimensions,
} from 'react-native';
import { getProfile } from '../../service/userStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationBell from '../../components/notifications/NotificationBell';
import { getDevicesByTeam, controlDevice, updateDeviceSchedule } from '../../service/deviceService';
const { width: SCREEN_W } = Dimensions.get('window');
const TEAMS = [
  { id: 1, label: 'Team A', icon: 'leaf' },
  { id: 2, label: 'Team B', icon: 'water' },
  { id: 3, label: 'Team C', icon: 'sunny' },
  { id: 4, label: 'Team D', icon: 'flask' },
];
const DEVICE_CONFIG = {
  water_pump:    { icon: 'water',        gradient: ['#0ea5e9', '#2563eb'], label: 'Water Pump'    },
  nutrient_pump: { icon: 'flask',        gradient: ['#a855f7', '#7c3aed'], label: 'Nutrient Pump' },
  grow_lights:   { icon: 'sunny',        gradient: ['#f59e0b', '#e67e22'], label: 'Grow Lights'   },
  fan:           { icon: 'thunderstorm', gradient: ['#06b6d4', '#0891b2'], label: 'Fan'           },
};
const getDeviceConfig = (type) =>
  DEVICE_CONFIG[type] || { icon: 'hardware-chip', gradient: ['#64748b', '#475569'], label: type };
export default function ControlScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(TEAMS[0]);
  const [userRole, setUserRole] = useState('user');
  const [userTeamId, setUserTeamId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [runDuration, setRunDuration] = useState('');
  const [intervalTime, setIntervalTime] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [selectedTeam])
  );
  const loadUser = async () => {
    const raw = await AsyncStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      setUserRole(user.role || 'user');
      setUserTeamId(user.team_id || null);
    }
    const profile = await getProfile();
    setUserAvatar(profile.avatar || null);
    await loadDevices();
  };
  const loadDevices = async () => {
    setLoading(true);
    const data = await getDevicesByTeam(selectedTeam.id);
    setDevices(data);
    setLoading(false);
  };
  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getDevicesByTeam(selectedTeam.id);
    setDevices(data);
    setRefreshing(false);
  };
  const canControl = (device) => {
    if (userRole === 'admin') return true;
    return device.team_id === userTeamId;
  };
  const handleToggle = async (device, newStatus) => {
    if (!canControl(device)) {
      Alert.alert('Access Denied', 'You can only control devices assigned to your team.');
      return;
    }
    setTogglingId(device.control_id);
    try {
      await controlDevice(device.control_id, newStatus ? 1 : 0);
      setDevices(prev =>
        prev.map(d =>
          d.control_id === device.control_id ? { ...d, status: newStatus ? 1 : 0 } : d
        )
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to control device.');
    } finally {
      setTogglingId(null);
    }
  };
  const handleOpenSchedule = (device) => {
    if (!canControl(device)) {
      Alert.alert('Access Denied', 'You can only update devices assigned to your team.');
      return;
    }
    setSelectedDevice(device);
    setStartTime(device.start_time || '');
    setEndTime(device.end_time || '');
    setRunDuration(device.run_duration ? String(device.run_duration) : '');
    setIntervalTime(device.interval_time ? String(device.interval_time) : '');
    setScheduleModal(true);
  };
  const handleSaveSchedule = async () => {
    if (!selectedDevice) return;
    setSavingSchedule(true);
    try {
      await updateDeviceSchedule(selectedDevice.control_id, {
        start_time: startTime || null,
        end_time: endTime || null,
        run_duration: runDuration ? parseInt(runDuration) : null,
        interval_time: intervalTime ? parseInt(intervalTime) : null,
      });
      setDevices(prev =>
        prev.map(d =>
          d.control_id === selectedDevice.control_id
            ? { ...d, start_time: startTime, end_time: endTime, run_duration: runDuration, interval_time: intervalTime }
            : d
        )
      );
      Alert.alert('Success', 'Schedule updated successfully!');
      setScheduleModal(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    return timeStr.substring(0, 5);
  };
  const userTeamLabel = userTeamId === 1 ? 'A' : userTeamId === 2 ? 'B' : userTeamId === 3 ? 'C' : 'D';
  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarRing}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <Image source={require('../../../assets/icon.png')} style={styles.avatar} />
            )}
          </View>
          <View>
            <Text style={styles.headerSub}>Device Control</Text>
            <Text style={styles.headerTitle}>{selectedTeam.label}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.roleBadge}>
            <Ionicons
              name={userRole === 'admin' ? 'shield-checkmark' : 'person'}
              size={12}
              color="#3a6b47"
            />
            <Text style={styles.roleBadgeText}>
              {userRole === 'admin' ? 'Admin' : 'User'}
            </Text>
          </View>
          <NotificationBell />
        </View>
      </View>
      {/* ── Team Selector ── */}
      <View style={styles.teamSelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamSelector}
        >
          {TEAMS.map((team) => {
            const active = selectedTeam.id === team.id;
            return (
              <TouchableOpacity
                key={team.id}
                style={[styles.teamBtn, active && styles.teamBtnActive]}
                onPress={() => setSelectedTeam(team)}
                activeOpacity={0.7}
              >
                <View style={[styles.teamIconCircle, active && styles.teamIconCircleActive]}>
                  <Ionicons
                    name={team.icon}
                    size={16}
                    color={active ? '#fff' : '#7a8a6e'}
                  />
                </View>
                <Text style={[styles.teamBtnText, active && styles.teamBtnTextActive]}>
                  {team.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {/* ── Info Banner ── */}
      {userRole !== 'admin' && (
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="information-circle" size={16} color="#3a6b47" />
          </View>
          <Text style={styles.infoBannerText}>
            You can only control <Text style={{ fontWeight: '700' }}>Team {userTeamLabel}</Text> devices.
          </Text>
        </View>
      )}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#3a6b47" />
          </View>
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a6b47']} />
          }
        >
          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={16} color="#5a7a4e" />
            <Text style={styles.sectionTitle}>{selectedTeam.label} — Devices</Text>
            <View style={styles.deviceCountBadge}>
              <Text style={styles.deviceCountText}>{devices.length}</Text>
            </View>
          </View>
          {devices.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="hardware-chip-outline" size={36} color="#b5c4a8" />
              </View>
              <Text style={styles.emptyTitle}>No devices found</Text>
              <Text style={styles.emptySub}>This team has no registered devices yet.</Text>
            </View>
          ) : (
            devices.map((device) => {
              const config = getDeviceConfig(device.device_type);
              const isOn = device.status === 1;
              const locked = !canControl(device);
              const isToggling = togglingId === device.control_id;
              const accentColor = config.gradient[0];
              return (
                <View key={device.control_id} style={[styles.deviceCard, locked && styles.deviceCardLocked]}>
                  {/* ── Card inner ── */}
                  <View style={styles.deviceCardInner}>
                    {/* Top Row */}
                    <View style={styles.deviceTopRow}>
                      <View
                        style={[
                          styles.deviceIconBox,
                          {
                            backgroundColor: locked
                              ? 'rgba(0,0,0,0.04)'
                              : accentColor + '14',
                            borderColor: locked
                              ? 'rgba(0,0,0,0.06)'
                              : accentColor + '25',
                          },
                        ]}
                      >
                        <Ionicons
                          name={config.icon}
                          size={24}
                          color={locked ? '#b5b5b5' : accentColor}
                        />
                      </View>
                      <View style={styles.deviceInfo}>
                        <Text style={[styles.deviceName, locked && styles.deviceNameLocked]}>
                          {device.device_name}
                        </Text>
                        <Text style={styles.deviceType}>{config.label}</Text>
                      </View>
                      {locked ? (
                        <View style={styles.lockBadge}>
                          <Ionicons name="lock-closed" size={14} color="#c5c5c5" />
                        </View>
                      ) : (
                        <View style={styles.toggleArea}>
                          {isToggling ? (
                            <ActivityIndicator size="small" color={accentColor} />
                          ) : (
                            <Switch
                              value={isOn}
                              onValueChange={(val) => handleToggle(device, val)}
                              trackColor={{ false: '#ddd', true: accentColor + '60' }}
                              thumbColor={isOn ? accentColor : '#f0f0f0'}
                              ios_backgroundColor="#ddd"
                            />
                          )}
                        </View>
                      )}
                    </View>
                    {/* ── Divider ── */}
                    <View style={styles.cardDivider} />
                    {/* ── Bottom row ── */}
                    <View style={styles.deviceBottomRow}>
                      {/* Status chip */}
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: isOn ? '#dcfce7' : '#f5f5f5',
                            borderColor: isOn ? '#86efac' : '#e5e5e5',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: isOn ? '#22c55e' : '#bbb' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: isOn ? '#16a34a' : '#aaa' },
                          ]}
                        >
                          {isOn ? 'On' : 'Off'}
                        </Text>
                      </View>
                      {/* Schedule info */}
                      {(device.start_time || device.run_duration) ? (
                        <View style={styles.scheduleInfoChip}>
                          <Ionicons name="time-outline" size={12} color="#8a9a7e" />
                          <Text style={styles.scheduleInfoText}>
                            {device.start_time
                              ? `${formatTime(device.start_time)}–${formatTime(device.end_time)}`
                              : ''}
                            {device.run_duration ? ` · ${device.run_duration}m` : ''}
                          </Text>
                        </View>
                      ) : null}
                      {/* Schedule button */}
                      {!locked && (
                        <TouchableOpacity
                          style={styles.scheduleBtn}
                          onPress={() => handleOpenSchedule(device)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="calendar-outline" size={14} color="#3a6b47" />
                          <Text style={styles.scheduleBtnText}>Schedule</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
      {/* ── Schedule Modal ── */}
      <Modal
        visible={scheduleModal}
        animationType="slide"
        transparent
        onRequestClose={() => setScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalLabel}>Schedule</Text>
                <Text style={styles.modalTitle}>
                  {selectedDevice?.device_name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setScheduleModal(false)}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            {/* Time inputs row */}
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="play-circle-outline" size={14} color="#3a6b47" />
                  <Text style={styles.inputLabel}>Start Time</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="06:00"
                  placeholderTextColor="#c0c0c0"
                  value={startTime}
                  onChangeText={setStartTime}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.inputHalf}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="stop-circle-outline" size={14} color="#c0392b" />
                  <Text style={styles.inputLabel}>End Time</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="18:00"
                  placeholderTextColor="#c0c0c0"
                  value={endTime}
                  onChangeText={setEndTime}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="hourglass-outline" size={14} color="#e67e22" />
                  <Text style={styles.inputLabel}>Duration (min)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor="#c0c0c0"
                  value={runDuration}
                  onChangeText={setRunDuration}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="repeat-outline" size={14} color="#2980b9" />
                  <Text style={styles.inputLabel}>Interval (min)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="60"
                  placeholderTextColor="#c0c0c0"
                  value={intervalTime}
                  onChangeText={setIntervalTime}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, savingSchedule && { opacity: 0.6 }]}
              onPress={handleSaveSchedule}
              disabled={savingSchedule}
              activeOpacity={0.8}
            >
              {savingSchedule ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Schedule</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
/* ─────────────── Styles ─────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF4BE' },
  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58,107,71,0.08)',
    elevation: 3,
    shadowColor: '#2d5a3a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3a6b47',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  headerSub: { fontSize: 11, color: '#8a9a7e', fontWeight: '500', letterSpacing: 0.5 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#2d4a35', letterSpacing: 0.2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#edf5e8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d5e6cc',
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#3a6b47' },
  /* ── Team Selector ── */
  teamSelectorWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58,107,71,0.06)',
  },
  teamSelector: { paddingHorizontal: 18, gap: 10 },
  teamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f7f7f2',
    borderWidth: 1.5,
    borderColor: '#e8e8dc',
  },
  teamBtnActive: {
    backgroundColor: '#3a6b47',
    borderColor: '#3a6b47',
    elevation: 3,
    shadowColor: '#3a6b47',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  teamIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(122,138,110,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamIconCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  teamBtnText: { fontSize: 13, fontWeight: '700', color: '#7a8a6e' },
  teamBtnTextActive: { color: '#fff' },
  /* ── Info Banner ── */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e4f0dc',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d0e0c4',
  },
  infoBannerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(58,107,71,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBannerText: { fontSize: 12, color: '#3a6b47', fontWeight: '500', flex: 1 },
  /* ── Loading ── */
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(58,107,71,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { fontSize: 13, color: '#8a9a7e', fontWeight: '500' },
  /* ── List ── */
  listContent: { padding: 18 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#3a5040', flex: 1, letterSpacing: 0.2 },
  deviceCountBadge: {
    backgroundColor: '#3a6b47',
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceCountText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  /* ── Empty ── */
  emptyWrapper: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(58,107,71,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#8a9a7e' },
  emptySub: { fontSize: 13, color: '#aab89e' },
  /* ── Device Card ── */
  deviceCard: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#2d5a3a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(58,107,71,0.06)',
  },
  deviceCardLocked: { opacity: 0.65 },
  deviceCardInner: { padding: 16 },
  deviceTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  deviceIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '800', color: '#1e3a28', letterSpacing: 0.1 },
  deviceNameLocked: { color: '#b0b0b0' },
  deviceType: { fontSize: 12, color: '#8a9a7e', marginTop: 2, fontWeight: '500' },
  lockBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e0',
  },
  toggleArea: { justifyContent: 'center', alignItems: 'center', minWidth: 52 },
  /* Divider */
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(58,107,71,0.06)',
    marginVertical: 14,
    marginHorizontal: -2,
  },
  /* Bottom row */
  deviceBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  scheduleInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f5f7f0',
  },
  scheduleInfoText: { fontSize: 11, color: '#8a9a7e', fontWeight: '500' },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#edf5e8',
    borderWidth: 1,
    borderColor: '#d5e6cc',
    marginLeft: 'auto',
  },
  scheduleBtnText: { fontSize: 12, color: '#3a6b47', fontWeight: '700' },
  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLabel: { fontSize: 12, color: '#8a9a7e', fontWeight: '600', letterSpacing: 0.5 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1e3a28', marginTop: 2 },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputHalf: { flex: 1 },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  inputLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e5dc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafaf6',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#3a6b47',
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 3,
    shadowColor: '#3a6b47',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
});
