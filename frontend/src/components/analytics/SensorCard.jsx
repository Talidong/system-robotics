// src/components/analytics/SensorCard.jsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import StatusIndicator from './StatusIndicator';

export default function SensorCard({ label, value, unit, color, status, icon }) {
  // Use status color for dynamic indicators, fallback to sensor color
  const indicatorColor = status?.color || color;
  const isNormal = status?.label === 'Normal' || status?.label === 'Sufficient';

  return (
    <View style={[styles.cardContainer, isNormal && styles.cardNormal]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 45 : 85}
        tint="light"
        style={styles.blurWrapper}
      >
        {/* Top indicator bar — changes color based on status */}
        <View style={[styles.topIndicator, { backgroundColor: indicatorColor }]} />

        <View style={styles.topRow}>
          {/* Icon circle — uses sensor's base color (stays consistent) */}
          <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <StatusIndicator label={status.label} color={indicatorColor} />
        </View>

        <Text style={styles.value}>
          {value}
          <Text style={styles.unit}> {unit}</Text>
        </Text>

        <Text style={styles.label}>{label}</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '47%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Subtle green glow when normal/healthy
  cardNormal: {
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blurWrapper: {
    padding: 14,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 255, 255, 0.4)'
      : 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 2,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});