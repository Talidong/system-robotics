// src/components/account/SuccessCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessCard({ title, subtitle, highlight, buttonLabel, onPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={40} color="#fff" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {highlight && <Text style={styles.highlight}>{highlight}</Text>}
      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4a7c59',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  highlight: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#3a6b47',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});