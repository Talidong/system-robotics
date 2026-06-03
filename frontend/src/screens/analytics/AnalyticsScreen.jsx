// src/screens/analytics/AnalyticsScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SensorCard from '../../components/analytics/SensorCard';
import SensorChart from '../../components/analytics/SensorChart';
import NotificationBell from '../../components/notifications/NotificationBell';
import { getProfile } from '../../service/userStorage';
import {
  getCurrentReadings,
  getHistoricalData,
  getSensorStatus,
  SENSOR_CONFIG,
} from '../../service/sensorService';

const { width: SCREEN_W } = Dimensions.get('window');

const SENSOR_ICONS = {
  waterLevel:  'water-outline',
  temperature: 'thermometer-outline',
  humidity:    'rainy-outline',
  phLevel:     'flask-outline',
  nutrient:    'leaf-outline',
};

// ← Sensors na walang hardware, i-flag as maintenance
const MAINTENANCE_SENSORS = ['waterLevel', 'humidity'];

const CHART_TABS = [
  { key: 'waterLevel',  label: 'Water',    icon: 'water-outline' },
  { key: 'temperature', label: 'Temp',     icon: 'thermometer-outline' },
  { key: 'humidity',    label: 'Humidity', icon: 'rainy-outline' },
  { key: 'phLevel',     label: 'pH',       icon: 'flask-outline' },
  { key: 'nutrient',    label: 'Nutrient', icon: 'leaf-outline' },
];

const TEAMS = [
  { id: 1, label: 'Team A', icon: 'leaf' },
  { id: 2, label: 'Team B', icon: 'water' },
  { id: 3, label: 'Team C', icon: 'sunny' },
  { id: 4, label: 'Team D', icon: 'flask' },
];

/* ── Empty State Illustration ── */
function EmptyState({ teamLabel, type = 'readings' }) {
  const isChart = type === 'chart';
  return (
    <View style={emptyStyles.wrapper}>
      {/* SVG-style illustration using Views */}
      <View style={emptyStyles.illustrationWrap}>
        {/* Outer glow ring */}
        <View style={emptyStyles.glowRing} />
        {/* Main circle */}
        <View style={emptyStyles.mainCircle}>
          {/* Inner decorative circles */}
          <View style={emptyStyles.innerRing} />
          {/* Center icon stack */}
          <View style={emptyStyles.centerIconWrap}>
            <Ionicons
              name={isChart ? 'analytics-outline' : 'leaf-outline'}
              size={36}
              color="#3a6b47"
            />
          </View>
        </View>
        {/* Floating sensor dots */}
        <View style={[emptyStyles.floatDot, emptyStyles.dot1]}>
          <Ionicons name="thermometer-outline" size={13} color="#FF5722" />
        </View>
        <View style={[emptyStyles.floatDot, emptyStyles.dot2]}>
          <Ionicons name="flask-outline" size={13} color="#9C27B0" />
        </View>
        <View style={[emptyStyles.floatDot, emptyStyles.dot3]}>
          <Ionicons name="leaf-outline" size={13} color="#4CAF50" />
        </View>
        {/* Signal waves */}
        <View style={[emptyStyles.wave, emptyStyles.wave1]} />
        <View style={[emptyStyles.wave, emptyStyles.wave2]} />
        <View style={[emptyStyles.wave, emptyStyles.wave3]} />
      </View>

      <Text style={emptyStyles.title}>
        {isChart ? 'No Graph Data Yet' : 'Waiting for Sensor Data'}
      </Text>
      <Text style={emptyStyles.sub}>
        {isChart
          ? `${teamLabel} hasn't sent any historical readings yet.\nData will appear once the sensor is active.`
          : `${teamLabel} sensors haven't reported yet.\nMake sure the device is powered on and connected.`}
      </Text>

      {/* Status chips */}
      <View style={emptyStyles.chipsRow}>
        <View style={emptyStyles.chip}>
          <View style={[emptyStyles.chipDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={emptyStyles.chipText}>Waiting for device</Text>
        </View>
        <View style={emptyStyles.chip}>
          <View style={[emptyStyles.chipDot, { backgroundColor: '#60a5fa' }]} />
          <Text style={emptyStyles.chipText}>Pull to refresh</Text>
        </View>
      </View>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 18,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58,107,71,0.08)',
    elevation: 2,
    shadowColor: '#2d5a3a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  illustrationWrap: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(58,107,71,0.06)',
  },
  mainCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(58,107,71,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(58,107,71,0.12)',
  },
  innerRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: 'rgba(58,107,71,0.15)',
    borderStyle: 'dashed',
  },
  centerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#edf5e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8eaed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  dot1: { top: 10,  right: 10 },
  dot2: { bottom: 14, left: 8 },
  dot3: { top: 14, left: 12 },
  wave: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(58,107,71,0.1)',
  },
  wave1: { width: 108, height: 108, borderRadius: 54 },
  wave2: { width: 122, height: 122, borderRadius: 61, borderColor: 'rgba(58,107,71,0.07)' },
  wave3: { width: 136, height: 136, borderRadius: 68, borderColor: 'rgba(58,107,71,0.04)' },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2d4a35',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 12,
    color: '#8a9a7e',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f4f6f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4e8e2',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6a7a65',
  },
});

/* ── Pulse dot for LIVE badge ── */
function LivePulse() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 2.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <View style={liveStyles.wrap}>
      <Animated.View
        style={[
          liveStyles.ring,
          {
            transform: [{ scale: pulse }],
            opacity: pulse.interpolate({ inputRange: [1, 2.2], outputRange: [0.5, 0] }),
          },
        ]}
      />
      <View style={liveStyles.dot} />
    </View>
  );
}

const liveStyles = StyleSheet.create({
  wrap: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center' },
  ring: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#ef4444' },
  dot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
});

/* ── Maintenance Card overlay ── */
function MaintenanceCard({ label, icon }) {
  return (
    <View style={maintenanceStyles.card}>
      {/* Diagonal stripe overlay */}
      <View style={maintenanceStyles.stripeOverlay} />
      <View style={maintenanceStyles.content}>
        <View style={maintenanceStyles.iconCircle}>
          <Ionicons name={icon} size={20} color="#b0b8c1" />
        </View>
        <Text style={maintenanceStyles.label}>{label}</Text>
        <View style={maintenanceStyles.badge}>
          <Ionicons name="construct-outline" size={10} color="#8a95a3" />
          <Text style={maintenanceStyles.badgeText}>Under Maintenance</Text>
        </View>
        <Text style={maintenanceStyles.sub}>Sensor not available</Text>
      </View>
    </View>
  );
}

const maintenanceStyles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#f0f2f5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 120,
  },
  stripeOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.04,
    backgroundColor: '#000',
  },
  content: {
    padding: 14,
    alignItems: 'flex-start',
    gap: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e4e8ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9aa3ad',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e4e8ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8a95a3',
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 10,
    color: '#b0b8c1',
    marginTop: 2,
  },
});

/* ── Maintenance Chart Placeholder ── */
function MaintenanceChart({ label, icon }) {
  return (
    <View style={maintenanceChartStyles.wrapper}>
      <View style={maintenanceChartStyles.card}>
        <View style={maintenanceChartStyles.header}>
          <View style={maintenanceChartStyles.titleRow}>
            <Ionicons name={icon} size={16} color="#b0b8c1" />
            <Text style={maintenanceChartStyles.title}>{label}</Text>
          </View>
          <View style={maintenanceChartStyles.badge}>
            <Ionicons name="construct-outline" size={10} color="#8a95a3" />
            <Text style={maintenanceChartStyles.badgeText}>Under Maintenance</Text>
          </View>
        </View>
        {/* Fake chart bars grayed out */}
        <View style={maintenanceChartStyles.fakeChart}>
          {[40, 65, 30, 80, 50, 70, 45].map((h, i) => (
            <View key={i} style={[maintenanceChartStyles.bar, { height: h }]} />
          ))}
        </View>
        <View style={maintenanceChartStyles.footer}>
          <Ionicons name="information-circle-outline" size={13} color="#b0b8c1" />
          <Text style={maintenanceChartStyles.footerText}>
            No sensor hardware available for this metric.
          </Text>
        </View>
      </View>
    </View>
  );
}

const maintenanceChartStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 18 },
  card: {
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontWeight: '800', color: '#9aa3ad' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e4e8ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#8a95a3' },
  fakeChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 8,
    marginBottom: 12,
    opacity: 0.25,
  },
  bar: {
    width: 28,
    backgroundColor: '#9aa3ad',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e4e8ed',
    padding: 10,
    borderRadius: 10,
  },
  footerText: { fontSize: 11, color: '#9aa3ad', flex: 1 },
});

/* ── Main Screen ── */
export default function AnalyticsScreen() {
  const [selectedTeam, setSelectedTeam]   = useState(TEAMS[0]);
  const [readings, setReadings]           = useState(null);
  const [historical, setHistorical]       = useState(null);
  const [activeChart, setActiveChart]     = useState('temperature'); // ← default to temp since water is maintenance
  const [refreshing, setRefreshing]       = useState(false);
  const [loading, setLoading]             = useState(true);
  const [lastUpdated, setLastUpdated]     = useState(new Date());
  const [userAvatar, setUserAvatar]       = useState(null);

  useEffect(() => {
    const loadAvatar = async () => {
      const profile = await getProfile();
      setUserAvatar(profile?.avatar || null);
    };
    loadAvatar();
  }, []);

  const loadData = async (teamId) => {
    const [curr, hist] = await Promise.all([
      getCurrentReadings(teamId),
      getHistoricalData(teamId),
    ]);
    if (curr) setReadings(curr);
    else setReadings(null);
    if (hist) setHistorical(hist);
    else setHistorical(null);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData(selectedTeam.id);
      setLoading(false);
    };
    init();
    const interval = setInterval(() => loadData(selectedTeam.id), 5000);
    return () => clearInterval(interval);
  }, [selectedTeam]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(selectedTeam.id);
    setRefreshing(false);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const isMaintenance = (key) => MAINTENANCE_SENSORS.includes(key);

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
            <Text style={styles.headerSub}>Data Analytics</Text>
            <Text style={styles.headerTitle}>{selectedTeam.label}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.roleBadge}>
            <Ionicons name="bar-chart" size={12} color="#3a6b47" />
            <Text style={styles.roleBadgeText}>Live</Text>
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
                onPress={() => {
                  setSelectedTeam(team);
                  setReadings(null);
                  setHistorical(null);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.teamIconCircle, active && styles.teamIconCircleActive]}>
                  <Ionicons name={team.icon} size={16} color={active ? '#fff' : '#7a8a6e'} />
                </View>
                <Text style={[styles.teamBtnText, active && styles.teamBtnTextActive]}>
                  {team.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#3a6b47" />
          </View>
          <Text style={styles.loadingText}>Loading {selectedTeam.label} data...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a6b47']} />
          }
        >
          {/* ── Status Bar ── */}
          <View style={styles.statusBar}>
            <View style={styles.statusBarLeft}>
              <Ionicons name="time-outline" size={14} color="#8a9a7e" />
              <Text style={styles.updateText}>{formatTime(lastUpdated)}</Text>
            </View>
            <View style={styles.liveBadge}>
              <LivePulse />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* ── Section: Current Readings ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Current Readings</Text>
            </View>
            <View style={styles.teamChip}>
              <Ionicons name={selectedTeam.icon} size={12} color="#3a6b47" />
              <Text style={styles.teamChipText}>{selectedTeam.label}</Text>
            </View>
          </View>

          <View style={styles.cardsGrid}>
            {Object.keys(SENSOR_CONFIG).map((key) => {
              const config = SENSOR_CONFIG[key];

              // ← Under Maintenance card
              if (isMaintenance(key)) {
                return (
                  <MaintenanceCard
                    key={key}
                    label={config.label}
                    icon={SENSOR_ICONS[key]}
                  />
                );
              }

              if (!readings) return null;

              const value  = readings[key];
              const status = getSensorStatus(key, value);
              return (
                <SensorCard
                  key={key}
                  label={config.label}
                  value={value}
                  unit={config.unit}
                  color={config.color}
                  status={status}
                  icon={SENSOR_ICONS[key]}
                />
              );
            })}
          </View>

          {/* Show empty state when no readings for non-maintenance sensors */}
          {!readings && (
            <EmptyState teamLabel={selectedTeam.label} type="readings" />
          )}

          {/* ── Section: Live Graphs ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionDot, { backgroundColor: '#60a5fa' }]} />
              <Text style={styles.sectionTitle}>Live Graphs</Text>
            </View>
          </View>

          {/* ── Chart Tabs ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {CHART_TABS.map((tab) => {
              const active  = activeChart === tab.key;
              const isMaint = isMaintenance(tab.key);
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    active && styles.tabActive,
                    isMaint && styles.tabMaintenance,      // ← gray tab
                  ]}
                  onPress={() => setActiveChart(tab.key)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.tabIconCircle,
                    active && styles.tabIconCircleActive,
                    isMaint && styles.tabIconCircleMaintenance,
                  ]}>
                    <Ionicons
                      name={isMaint ? 'construct-outline' : tab.icon}
                      size={14}
                      color={active ? '#fff' : isMaint ? '#b0b8c1' : '#8a9a7e'}
                    />
                  </View>
                  <Text style={[
                    styles.tabText,
                    active && styles.tabTextActive,
                    isMaint && styles.tabTextMaintenance,
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Chart ── */}
          {isMaintenance(activeChart) ? (
            // ← Show maintenance placeholder instead of chart
            <MaintenanceChart
              label={SENSOR_CONFIG[activeChart].label}
              icon={SENSOR_ICONS[activeChart]}
            />
          ) : historical ? (
            <View style={styles.chartWrapper}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <Ionicons
                      name={CHART_TABS.find(t => t.key === activeChart)?.icon || 'analytics'}
                      size={16}
                      color={SENSOR_CONFIG[activeChart].color}
                    />
                    <Text style={styles.chartTitle}>{SENSOR_CONFIG[activeChart].label}</Text>
                  </View>
                  <View style={[
                    styles.chartUnitBadge,
                    {
                      backgroundColor: SENSOR_CONFIG[activeChart].color + '18',
                      borderColor: SENSOR_CONFIG[activeChart].color + '30',
                    },
                  ]}>
                    <Text style={[styles.chartUnitText, { color: SENSOR_CONFIG[activeChart].color }]}>
                      {SENSOR_CONFIG[activeChart].unit}
                    </Text>
                  </View>
                </View>
                <SensorChart
                  title={SENSOR_CONFIG[activeChart].label}
                  labels={historical.labels}
                  data={historical[activeChart]}
                  color={SENSOR_CONFIG[activeChart].color}
                  unit={SENSOR_CONFIG[activeChart].unit}
                />
              </View>
            </View>
          ) : (
            <EmptyState teamLabel={selectedTeam.label} type="chart" />
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: '#3a6b47',
    padding: 2, justifyContent: 'center', alignItems: 'center',
  },
  avatar:      { width: 36, height: 36, borderRadius: 18 },
  headerSub:   { fontSize: 11, color: '#8a9a7e', fontWeight: '500', letterSpacing: 0.5 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#2d4a35', letterSpacing: 0.2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#edf5e8', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#d5e6cc',
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#3a6b47' },
  /* ── Team Selector ── */
  teamSelectorWrapper: {
    backgroundColor: '#fff', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(58,107,71,0.06)',
  },
  teamSelector: { paddingHorizontal: 18, gap: 10 },
  teamBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, backgroundColor: '#f7f7f2',
    borderWidth: 1.5, borderColor: '#e8e8dc',
  },
  teamBtnActive: {
    backgroundColor: '#3a6b47', borderColor: '#3a6b47',
    elevation: 3, shadowColor: '#3a6b47',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6,
  },
  teamIconCircle: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(122,138,110,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  teamIconCircleActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  teamBtnText:       { fontSize: 13, fontWeight: '700', color: '#7a8a6e' },
  teamBtnTextActive: { color: '#fff' },
  /* ── Loading ── */
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(58,107,71,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { fontSize: 13, color: '#8a9a7e', fontWeight: '500' },
  /* ── Status Bar ── */
  statusBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 18, marginTop: 16, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(58,107,71,0.06)',
    elevation: 1, shadowColor: '#2d5a3a',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  statusBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  updateText:    { fontSize: 12, color: '#8a9a7e', fontWeight: '600' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#fecaca',
  },
  liveText: { fontSize: 10, fontWeight: '800', color: '#ef4444', letterSpacing: 0.8 },
  /* ── Sections ── */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, marginBottom: 14, marginTop: 16,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3a6b47' },
  sectionTitle:      { fontSize: 15, fontWeight: '800', color: '#3a5040', letterSpacing: 0.2 },
  teamChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#edf5e8', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#d5e6cc',
  },
  teamChipText: { fontSize: 11, fontWeight: '700', color: '#3a6b47' },
  /* ── Cards Grid ── */
  cardsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 18, justifyContent: 'space-between',
  },
  /* ── Error Box (kept for reference) ── */
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 18, marginBottom: 16,
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(230,126,34,0.15)',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  errorIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fef3e2', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#fde6c4',
  },
  errorTextWrap: { flex: 1 },
  errorTitle:    { fontSize: 14, fontWeight: '700', color: '#92400e', marginBottom: 2 },
  errorSub:      { fontSize: 12, color: '#b8860b' },
  /* ── Chart Tabs ── */
  tabsScroll:     { marginBottom: 14 },
  tabsContainer:  { paddingHorizontal: 18, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#e8e8dc',
  },
  tabActive: {
    backgroundColor: '#3a6b47', borderColor: '#3a6b47',
    elevation: 2, shadowColor: '#3a6b47',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  tabMaintenance: {                          // ← grayed out tab
    backgroundColor: '#f0f2f5', borderColor: '#dde1e7', borderStyle: 'dashed',
  },
  tabIconCircle: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: 'rgba(122,138,110,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  tabIconCircleActive:      { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabIconCircleMaintenance: { backgroundColor: '#e4e8ed' },  // ← gray icon bg
  tabText:            { fontSize: 12, fontWeight: '700', color: '#8a9a7e' },
  tabTextActive:      { color: '#fff' },
  tabTextMaintenance: { color: '#b0b8c1' },                  // ← gray text
  /* ── Chart ── */
  chartWrapper: { paddingHorizontal: 18 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(58,107,71,0.06)',
    elevation: 2, shadowColor: '#2d5a3a',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  chartHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartTitle:    { fontSize: 14, fontWeight: '800', color: '#2d4a35' },
  chartUnitBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  chartUnitText:  { fontSize: 11, fontWeight: '700' },
});