// src/components/analytics/SensorCard.jsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; 
import StatusIndicator from './StatusIndicator';


export default function SensorCard({ label, value, unit, color, status, icon }) {
  return (
    <View style={styles.cardContainer}>
      <BlurView 
        intensity={Platform.OS === 'ios' ? 45 : 85} 
        tint="light" 
        style={styles.blurWrapper}
      >
       
        <View style={[styles.topIndicator, { backgroundColor: color }]} />

        <View style={styles.topRow}>
         
          <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <StatusIndicator label={status.label} color={status.color} />
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
  blurWrapper: {
    padding: 14,

    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.75)',
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