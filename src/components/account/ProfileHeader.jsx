// src/components/account/ProfileHeader.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileHeader({ role = 'Admin', title = 'Account Profile', onNotifPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <View>
          <Text style={styles.headerRole}>{role}</Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onNotifPress}>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerRole: {
    fontSize: 11,
    color: '#666',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
});