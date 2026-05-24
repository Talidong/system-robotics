// src/screens/analytics/AnalyticsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SensorCard from '../../components/analytics/SensorCard';
import SensorChart from '../../components/analytics/SensorChart';
import {
  getCurrentReadings,
  getHistoricalData,
  getSensorStatus,
  SENSOR_CONFIG,
} from '../../service/sensorService';

// Icon per sensor
const SENSOR_ICONS = {
  waterLevel:  'water-outline',
  temperature: 'thermometer-outline',
  humidity:    'rainy-outline',
  phLevel:     'flask-outline',
  nutrient:    'leaf-outline',
};

// Tabs para sa chart selector
const CHART_TABS = [
  { key: 'waterLevel',  label: 'Water' },
  { key: 'temperature', label: 'Temp' },
  { key: 'humidity',    label: 'Humidity' },
  { key: 'phLevel',     label: 'pH' },
  { key: 'nutrient',    label: 'Nutrient' },
];

export default function AnalyticsScreen() {
  const [readings, setReadings] = useState(getCurrentReadings());
  const [historical, setHistorical] = useState(getHistoricalData());
  const [activeChart, setActiveChart] = useState('waterLevel');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ─── Auto-refresh every 5 seconds (simulated real-time) ──
  useEffect(() => {
    const interval = setInterval(() => {
      setReadings(getCurrentReadings());
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Manual refresh ───────────────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setReadings(getCurrentReadings());
      setHistorical(getHistoricalData());
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.headerRole}>Admin</Text>
            <Text style={styles.headerTitle}>Data Analytics</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a7c59']} />
        }
      >
        {/* Last updated */}
        <View style={styles.updateRow}>
          <Ionicons name="time-outline" size={13} color="#888" />
          <Text style={styles.updateText}>Last updated: {formatTime(lastUpdated)}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* ─── Sensor Cards ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Current Readings</Text>
        <View style={styles.cardsGrid}>
          {Object.keys(SENSOR_CONFIG).map((key) => {
            const config = SENSOR_CONFIG[key];
            const value = readings[key];
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

        {/* ─── Chart Section ────────────────────────────── */}
        <Text style={styles.sectionTitle}>Live Graphs</Text>

        {/* Tab Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContainer}
        >
          {CHART_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeChart === tab.key && styles.tabActive]}
              onPress={() => setActiveChart(tab.key)}
            >
              <Text style={[styles.tabText, activeChart === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Chart */}
        <View style={styles.chartWrapper}>
          <SensorChart
            title={SENSOR_CONFIG[activeChart].label}
            labels={historical.labels}
            data={historical[activeChart]}
            color={SENSOR_CONFIG[activeChart].color}
            unit={SENSOR_CONFIG[activeChart].unit}
          />
        </View>

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
  logo: { width: 36, height: 36, borderRadius: 18 },
  headerRole: { fontSize: 11, color: '#666' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  updateRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, paddingHorizontal: 16, paddingVertical: 10,
  },
  updateText: { fontSize: 12, color: '#888', flex: 1 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffebee', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10, gap: 4,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#F44336',
  },
  liveText: { fontSize: 10, fontWeight: '800', color: '#F44336' },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: '#333',
    paddingHorizontal: 16, marginBottom: 12, marginTop: 4,
  },
  cardsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, justifyContent: 'space-between',
  },
  tabsScroll: { marginBottom: 12 },
  tabsContainer: { paddingHorizontal: 16, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd',
  },
  tabActive: { backgroundColor: '#4a7c59', borderColor: '#4a7c59' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#fff' },
  chartWrapper: { paddingHorizontal: 16 },
});