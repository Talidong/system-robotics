// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUnreadCount } from '../../service/notificationService';

export default function NotificationBell() {
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem('user');
      if (raw) setUserId(JSON.parse(raw).user_id || null);
    };
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      const fetchCount = async () => setUnreadCount(await getUnreadCount(userId));
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }, [userId])
  );

  const handlePress = () => {
    // Subukan muna ang direct navigate
    // Kung hindi gumana, gamitin ang parent navigator
    try {
      navigation.navigate('Notifications');
    } catch {
      const parent = navigation.getParent();
      if (parent) parent.navigate('Notifications');
    }
  };

  return (
    <TouchableOpacity style={styles.wrapper} onPress={handlePress}>
      <Ionicons name="notifications-outline" size={24} color="#333" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', padding: 2 },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#E53935', borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});