// src/screens/notifications/NotificationScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Animated, Modal,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../../service/notificationService';

const { height: SCREEN_H } = Dimensions.get('window');

const TEAMS = [
  { id: 0, label: 'All Teams' },
  { id: 1, label: 'Team A' },
  { id: 2, label: 'Team B' },
  { id: 3, label: 'Team C' },
  { id: 4, label: 'Team D' },
];

const ALERT_CONFIG = {
  water_pump:     { icon: 'water',              color: '#0ea5e9', label: 'Water Pump'    },
  nutrient_pump:  { icon: 'flask',              color: '#a855f7', label: 'Nutrient Pump' },
  grow_lights:    { icon: 'sunny',              color: '#f59e0b', label: 'Grow Lights'   },
  fan:            { icon: 'thunderstorm',       color: '#06b6d4', label: 'Fan'           },
  
  water_level:    { icon: 'water',              color: '#0ea5e9', label: 'Water Level'    },
  temperature:    { icon: 'thermometer',        color: '#f97316', label: 'Temperature'    },
  humidity:       { icon: 'rainy',              color: '#06b6d4', label: 'Humidity'       },
  ph_level:       { icon: 'flask',              color: '#a855f7', label: 'pH Level'       },
  nutrient:       { icon: 'leaf',               color: '#22c55e', label: 'Nutrient'       },
  critical:       { icon: 'warning',            color: '#ef4444', label: 'Critical Alert' },
  warning:        { icon: 'alert-circle',       color: '#f59e0b', label: 'Warning'        },
  device_status:  { icon: 'hardware-chip',      color: '#64748b', label: 'Device'         },
  sensor_offline: { icon: 'wifi-outline',       color: '#ea580c', label: 'Sensor Offline' },
  schedule:       { icon: 'time',               color: '#3a6b47', label: 'Schedule'       },
  info:           { icon: 'information-circle', color: '#3a6b47', label: 'Info'           },
};

const getConfig = (type) => ALERT_CONFIG[type] || ALERT_CONFIG['info'];

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─────────────────────────────────────────────
   Animated Notification Card (Clean & Minimalist Layout)
   ───────────────────────────────────────────── */
const NotifCard = ({ notif, index, userTeamId, onRead, onDelete, onOpenCritical }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const config = getConfig(notif.alert_type);
  const isUnread = notif.is_read === 0;
  const isOwnTeam = Number(notif.team_id) === Number(userTeamId);
  const isCritical = notif.severity === 'critical';
  const isWarning = notif.severity === 'warning';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 40, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    if (isCritical) {
      onOpenCritical(notif);
    } else if (isUnread) {
      onRead(notif.alert_id);
    }
  };

  const getCardStyle = () => {
    if (isCritical && isOwnTeam) return cardStyles.wrapCriticalOwn;
    if (isCritical) return cardStyles.wrapCriticalOther;
    if (isWarning) return cardStyles.wrapWarning;
    return cardStyles.wrapNormal;
  };

  const getAccentColor = () => {
    if (isCritical) return '#E53935';
    if (isWarning) return '#FFC107';
    return config.color;
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[cardStyles.card, getCardStyle()]}
      >
        {/* Left Color Indicator Bar */}
        <View style={[cardStyles.accentBar, { backgroundColor: getAccentColor() }]} />
        
        {/* Unread Indicator Dot */}
        {isUnread && <View style={cardStyles.unreadDot} />}
        
        {/* THE ONLY ICON: Clean Boxed Sensor Icon */}
        <View style={[cardStyles.iconWrap, { backgroundColor: config.color + '12', borderColor: config.color + '25' }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>

        {/* Text Content Area */}
        <View style={cardStyles.content}>
          <View style={cardStyles.topRow}>
            <View style={cardStyles.labels}>
              <Text style={[cardStyles.typeText, { color: config.color }]}>
                {config.label}
              </Text>
              {notif.team_name && (
                <Text style={cardStyles.teamLabel}>• {notif.team_name}</Text>
              )}
              {isOwnTeam && (
                <View style={cardStyles.ownBadge}>
                  <Text style={cardStyles.ownBadgeText}>Your Team</Text>
                </View>
              )}
            </View>
            <Text style={cardStyles.time}>{formatTime(notif.created_at)}</Text>
          </View>

          {/* Clean Message Body */}
          <Text
            style={[cardStyles.message, isUnread && cardStyles.messageUnread]}
            numberOfLines={2}
          >
            {notif.message}
          </Text>

          {/* Action Hint Text */}
          {isCritical && (
            <Text style={cardStyles.criticalHint}>Tap to view full takeover screen</Text>
          )}
        </View>

        {/* Minimalist Dismiss Button */}
        <TouchableOpacity
          style={cardStyles.deleteBtn}
          onPress={() => onDelete(notif.alert_id)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={16} color="#bbb" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─────────────────────────────────────────────
   Premium Full-Screen Takeover Modal Component
   ───────────────────────────────────────────── */
const CriticalAlertModal = ({ visible, notif, onClose, onMarkRead, onDelete, userTeamId }) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!notif) return null;

  const config = getConfig(notif.alert_type);
  const isOwnTeam = Number(notif.team_id) === Number(userTeamId);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[modalStyles.overlay, { opacity: opacityAnim }]}>
        <LinearGradient
          colors={['#2d0505', '#7f1d1d', '#dc2626', '#991b1b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={modalStyles.gradientBg}
        >
          <SafeAreaView style={modalStyles.safeArea}>
            
            <View style={modalStyles.topHeader}>
              <TouchableOpacity style={modalStyles.closeBtnCircle} onPress={handleDismiss}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <Animated.View style={[modalStyles.contentWrap, { transform: [{ scale: scaleAnim }] }]}>
              
              <Animated.View style={[modalStyles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
                <View style={[modalStyles.iconInner, { backgroundColor: '#fff' }]}>
                  <Ionicons name={config.icon} size={42} color="#dc2626" />
                </View>
              </Animated.View>

              <View style={modalStyles.severityPill}>
                <Ionicons name="alert-circle" size={14} color="#fff" style={{ marginRight: 5 }} />
                <Text style={modalStyles.severityText}>CRITICAL HARDWARE MALFUNCTION</Text>
              </View>

              {/* CENTRAL DASHBOARD CARD */}
              <View style={modalStyles.mainDashboardCard}>
                <View style={modalStyles.cardHeaderRow}>
                  <Text style={[modalStyles.cardDeviceTitle, { color: config.color }]}>
                    {config.label.toUpperCase()}
                  </Text>
                  {notif.team_name && (
                    <View style={[modalStyles.cardTeamBadge, { backgroundColor: isOwnTeam ? '#e8f5e8' : '#f5f5f5' }]}>
                      <Text style={[modalStyles.cardTeamText, { color: isOwnTeam ? '#3a6b47' : '#666' }]}>
                        {notif.team_name} {isOwnTeam ? '(Mine)' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={modalStyles.cardDivider} />

                <ScrollView style={modalStyles.msgScroll} showsVerticalScrollIndicator={false}>
                  <Text style={modalStyles.cardMessageText}>
                    {notif.message}
                  </Text>
                </ScrollView>

                <View style={modalStyles.cardDivider} />

                <View style={modalStyles.timeInfoRow}>
                  <Ionicons name="time-outline" size={14} color="#888" />
                  <Text style={modalStyles.cardTimeText}>
                    Triggered: {new Date(notif.created_at).toLocaleString('en-PH')}
                  </Text>
                </View>
              </View>

              {/* ACTION FOOTER BUTTONS */}
              <View style={modalStyles.actionsRow}>
                {notif.is_read === 0 && (
                  <TouchableOpacity
                    style={[modalStyles.actionBtn, modalStyles.btnSuccess]}
                    onPress={() => { onMarkRead(notif.alert_id); handleDismiss(); }}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="checkmark-done-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={modalStyles.actionText}>Acknowledge Log</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[modalStyles.actionBtn, modalStyles.btnDanger]}
                  onPress={() => { onDelete(notif.alert_id); handleDismiss(); }}
                  activeOpacity={0.9}
                >
                  <Ionicons name="trash" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={modalStyles.actionText}>Delete Alert</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleDismiss} style={{ marginTop: 14 }}>
                <Text style={modalStyles.dismissText}>Tap anywhere outside or slide down to dismiss</Text>
              </TouchableOpacity>

            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

/* ─────────────────────────────────────────────
   Main Notification Screen
   ───────────────────────────────────────────── */
export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [criticalNotif, setCriticalNotif] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [selectedTeam])
  );

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      const id = user.user_id || null;
      const teamId = user.team_id || null;
      setUserId(id);
      setUserTeamId(teamId);
      if (id) await loadNotifications(id);
    }
    setLoading(false);
  };

  const loadNotifications = async (id) => {
    const data = await getNotificationsByUser(id || userId, selectedTeam);
    setNotifications(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(userId);
    setRefreshing(false);
  };

  const handleMarkAsRead = async (alertId) => {
    await markAsRead(alertId);
    setNotifications(prev =>
      prev.map(n => n.alert_id === alertId ? { ...n, is_read: 1 } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const handleDelete = (alertId) => {
    Alert.alert('Delete Notification', 'Are you sure you want to remove this log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteNotification(alertId);
          setNotifications(prev => prev.filter(n => n.alert_id !== alertId));
        },
      },
    ]);
  };

  const handleDirectDelete = async (alertId) => {
    await deleteNotification(alertId);
    setNotifications(prev => prev.filter(n => n.alert_id !== alertId));
  };

  const handleDeleteAll = () => {
    Alert.alert('Clear All Logs', 'This will wipe out all system alerts and logs permanently. Proceed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          await deleteAllNotifications(userId);
          setNotifications([]);
        },
      },
    ]);
  };

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFF4BE" />
      
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')}
        >
          <Ionicons name="chevron-back" size={20} color="#3a6b47" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.trashBtn} onPress={handleDeleteAll}>
          <Ionicons name="trash-outline" size={18} color="#E53935" />
        </TouchableOpacity>
      </View>

      {/* Team Slide Selector */}
      <View style={styles.teamWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamScroll}
        >
          {TEAMS.map(team => {
            const active = selectedTeam === team.id;
            return (
              <TouchableOpacity
                key={team.id}
                onPress={() => setSelectedTeam(team.id)}
                activeOpacity={0.7}
              >
                {active ? (
                  <LinearGradient colors={['#3a6b47', '#2d5236']} style={styles.teamChipActive}>
                    <Text style={styles.teamChipTextActive}>{team.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.teamChip}>
                    <Text style={styles.teamChipText}>{team.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bulk Read Trigger Action Bar */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBar} onPress={handleMarkAllAsRead} activeOpacity={0.85}>
          <Ionicons name="checkmark-done-circle-outline" size={16} color="#3a6b47" style={{ marginRight: 6 }} />
          <Text style={styles.markAllText}>Mark all as read ({unreadCount} entries unread)</Text>
        </TouchableOpacity>
      )}

      {/* Scrollable Logs List Area */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#3a6b47" />
          <Text style={{ marginTop: 10, color: '#8a9a7e', fontSize: 13, fontWeight: '600' }}>Loading logs...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a6b47']} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#b5c4a8" />
              </View>
              <Text style={styles.emptyTitle}>System Stable</Text>
              <Text style={styles.emptySub}>No warning messages or sensor triggers listed.</Text>
            </View>
          ) : (
            <View style={styles.listContent}>
              {notifications.map((notif, i) => (
                <NotifCard
                  key={notif.alert_id}
                  notif={notif}
                  index={i}
                  userTeamId={userTeamId}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onOpenCritical={(n) => setCriticalNotif(n)}
                />
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Full-Screen Takeover Modal Trigger */}
      <CriticalAlertModal
        visible={!!criticalNotif}
        notif={criticalNotif}
        userTeamId={userTeamId}
        onClose={() => setCriticalNotif(null)}
        onMarkRead={handleMarkAsRead}
        onDelete={handleDirectDelete}
      />
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────
   STYLES IMPLEMENTATION
   ───────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF4BE' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#f4f5ee', justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#2c3e2e' },
  headerBadge: {
    backgroundColor: '#E53935', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  headerBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  trashBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff0f0', justifyContent: 'center', alignItems: 'center',
  },
  teamWrapper: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  teamScroll: { paddingHorizontal: 16, gap: 10 },
  teamChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e5e5dc',
  },
  teamChipActive: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14 },
  teamChipText: { fontSize: 13, fontWeight: '600', color: '#7a8a6e' },
  teamChipTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },
  markAllBar: {
    flexDirection: 'row', backgroundColor: '#e8f2e9', marginHorizontal: 16, marginTop: 14, borderRadius: 12, paddingVertical: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#d3edd6',
  },
  markAllText: { fontSize: 12, color: '#3a6b47', fontWeight: '700' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyWrap: { alignItems: 'center', marginTop: 120, gap: 8 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 24, backgroundColor: 'rgba(58,107,71,0.05)', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#7a8a6e' },
  emptySub: { fontSize: 13, color: '#a0af95', textAlign: 'center', paddingHorizontal: 40 },
  listContent: { padding: 16, gap: 12 },
});

/* List Card Styling - Minimalist & Focus Text Layout */
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', 
    borderRadius: 16, 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 4, 
    position: 'relative', 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.02)',
  },
  wrapCriticalOwn: { backgroundColor: '#fff5f5' },
  wrapCriticalOther: { backgroundColor: '#fffbfb' },
  wrapWarning: { backgroundColor: '#fffbeb' },
  wrapNormal: { backgroundColor: '#fff' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4.5 },
  unreadDot: { position: 'absolute', top: 18, left: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935' },
  iconWrap: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, flexShrink: 0 },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  labels: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 },
  typeText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  teamLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
  ownBadge: { backgroundColor: '#e8f5e9', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  ownBadgeText: { fontSize: 9, color: '#3a6b47', fontWeight: '800' },
  time: { fontSize: 11, color: '#95a5a6', fontWeight: '500' },
  message: { fontSize: 14, color: '#555', lineHeight: 20 },
  messageUnread: { color: '#1a1a1a', fontWeight: '700' },
  criticalHint: { fontSize: 11, color: '#E53935', fontWeight: '700', marginTop: 6, opacity: 0.9, letterSpacing: 0.2 },
  deleteBtn: { padding: 6, flexShrink: 0, marginLeft: 4 },
});

/* Modal Styling Structure */
const modalStyles = StyleSheet.create({
  overlay: { flex: 1 },
  gradientBg: { flex: 1 },
  safeArea: { flex: 1 },
  topHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 12 },
  closeBtnCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  contentWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 24, justifyContent: 'center', transform: [{translateY: -20}] },
  iconRing: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    elevation: 10, shadowColor: '#000', shadowRadius: 10, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 },
  },
  iconInner: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center' },
  severityPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#7f1d1d', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#ef4444',
  },
  severityText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  
  mainDashboardCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 22, width: '100%', maxHeight: SCREEN_H * 0.42,
    elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, marginBottom: 24,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDeviceTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  cardTeamBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cardTeamText: { fontSize: 12, fontWeight: '800' },
  cardDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },
  msgScroll: { flexGrow: 0 },
  cardMessageText: { fontSize: 16, color: '#1e293b', fontWeight: '700', lineHeight: 26, textAlign: 'left' },
  timeInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  cardTimeText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  
  actionsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: {
    flex: 1, flexDirection: 'row', paddingVertical: 15, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowRadius: 6, shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 },
  },
  btnSuccess: { backgroundColor: '#10b981' }, 
  btnDanger: { backgroundColor: '#1e293b' },  
  actionText: { fontSize: 14, color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
  dismissText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500', textAlign: 'center' },
});