// src/components/account/AccountSettingsCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountSettingsCard({ onEmailPress, onPhonePress, onPasswordPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="settings-outline" size={16} color="#333" />
        <Text style={styles.cardTitle}>Account Settings</Text>
      </View>

      <TouchableOpacity style={styles.settingsRow} onPress={onEmailPress}>
        <Text style={styles.settingsLabel}>Email Address</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsRow} onPress={onPhonePress}>
        <Text style={styles.settingsLabel}>Phone Number</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsRow} onPress={onPasswordPress}>
        <Text style={styles.settingsLabel}>Change Password</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsLabel: {
    fontSize: 14,
    color: '#333',
  },
});