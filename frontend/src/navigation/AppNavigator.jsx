// src/navigation/AppNavigator.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountNavigator from './AccountNavigator';
import PlantsNavigator from './PlantsNavigator';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import ControlScreen from '../screens/control/ControlScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import {
  getUnreadNotifications,
  markAsRead,
} from '../service/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Alert Type Config (mirrors NotificationScreen) ───────
const ALERT_CONFIG = {
  water_pump:     { icon: 'water',              color: '#0ea5e9', label: 'Water Pump'    },
  nutrient_pump:  { icon: 'flask',              color: '#a855f7', label: 'Nutrient Pump' },
  grow_lights:    { icon: 'sunny',              color: '#f59e0b', label: 'Grow Lights'   },
  fan:            { icon: 'thunderstorm',       color: '#06b6d4', label: 'Fan'           },
  water_level:    { icon: 'water',              color: '#0ea5e9', label: 'Water Level'   },
  temperature:    { icon: 'thermometer',        color: '#f97316', label: 'Temperature'   },
  humidity:       { icon: 'rainy',              color: '#06b6d4', label: 'Humidity'      },
  ph_level:       { icon: 'flask',              color: '#a855f7', label: 'pH Level'      },
  nutrient:       { icon: 'leaf',               color: '#22c55e', label: 'Nutrient'      },
  critical:       { icon: 'warning',            color: '#ef4444', label: 'Critical Alert'},
  warning:        { icon: 'alert-circle',       color: '#f59e0b', label: 'Warning'       },
  device_status:  { icon: 'hardware-chip',      color: '#64748b', label: 'Device'        },
  sensor_offline: { icon: 'wifi-outline',       color: '#ea580c', label: 'Sensor Offline'},
  schedule:       { icon: 'time',               color: '#3a6b47', label: 'Schedule'      },
  info:           { icon: 'information-circle', color: '#3a6b47', label: 'Info'          },
};

const getConfig = (type) => ALERT_CONFIG[type] || ALERT_CONFIG['critical'];

// ─── Tab Navigator ─────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#33b355',
        tabBarInactiveTintColor: '#4a7c59',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'Control') iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          else if (route.name === 'Plants') iconName = focused ? 'leaf' : 'leaf-outline';
          else if (route.name === 'Account') iconName = focused ? 'person' : 'person-outline';

          return (
            <View style={focused ? styles.activeIconWrapper : styles.inactiveIconWrapper}>
              <Ionicons name={iconName} size={18} color={focused ? '#fff' : '#4a7c59'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Control" component={ControlScreen} />
      <Tab.Screen name="Plants" component={PlantsNavigator} />
      <Tab.Screen name="Account" component={AccountNavigator} />
    </Tab.Navigator>
  );
}

// ─── Global Critical Alert ─────────────────────────────────
function GlobalCriticalAlert() {
  const [userId, setUserId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const shownAlertIds = useRef(new Set());

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem('user');
      if (raw) setUserId(JSON.parse(raw).user_id || null);
    };
    loadUser();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const raw = await AsyncStorage.getItem('user');
      const userTeamId = raw ? JSON.parse(raw).team_id : null;
      const data = await getUnreadNotifications(userId);

      const newCriticals = data.filter(
        n =>
          n.severity === 'critical' &&
          Number(n.team_id) === Number(userTeamId) &&
          !shownAlertIds.current.has(n.alert_id)
      );

      if (newCriticals.length > 0) {
        newCriticals.forEach(n => shownAlertIds.current.add(n.alert_id));
        setCriticalAlerts(newCriticals);
        setAlertVisible(true);
      }
    } catch (err) {
      console.error('GlobalCriticalAlert fetch error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Animate in/out when alertVisible changes
  useEffect(() => {
    if (alertVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 600, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } else {
      if (pulseRef.current) pulseRef.current.stop();
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [alertVisible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start(async () => {
      try {
        await Promise.all(criticalAlerts.map(n => markAsRead(n.alert_id)));
      } catch (e) {
        console.error('Mark read error:', e);
      }
      setAlertVisible(false);
      setCriticalAlerts([]);
    });
  };

  if (!alertVisible || criticalAlerts.length === 0) return null;

  const first = criticalAlerts[0];
  const cfg = getConfig(first.alert_type);
  const deviceLabel = cfg.label.toUpperCase();

  return (
    <Modal
      visible={alertVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[gStyles.overlay, { opacity: opacityAnim }]}>
        <LinearGradient
          colors={['#2d0505', '#7f1d1d', '#dc2626', '#991b1b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={gStyles.gradientBg}
        >
          <SafeAreaView style={gStyles.safeArea}>

            {/* Top Close Button */}
            <View style={gStyles.topHeader}>
              <TouchableOpacity style={gStyles.closeBtnCircle} onPress={handleDismiss}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <Animated.View style={[gStyles.contentWrap, { transform: [{ scale: scaleAnim }] }]}>

              {/* Pulsing Icon Ring */}
              <Animated.View style={[gStyles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
                <View style={gStyles.iconInner}>
                  <Ionicons name={cfg.icon} size={42} color="#dc2626" />
                </View>
              </Animated.View>

              {/* Severity Pill */}
              <View style={gStyles.severityPill}>
                <Ionicons name="alert-circle" size={14} color="#fff" style={{ marginRight: 5 }} />
                <Text style={gStyles.severityText}>CRITICAL HARDWARE MALFUNCTION</Text>
              </View>

              {/* Dashboard Card */}
              <View style={gStyles.dashCard}>

                <View style={gStyles.cardHeader}>
                  <Text style={[gStyles.deviceTitle, { color: cfg.color }]}>
                    {deviceLabel}
                  </Text>
                  {first.team_name && (
                    <View style={gStyles.teamBadge}>
                      <Text style={gStyles.teamBadgeText}>
                        {first.team_name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={gStyles.divider} />

                <ScrollView
                  style={gStyles.msgScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {criticalAlerts.map((alert, idx) => (
                    <Text key={alert.alert_id || idx} style={gStyles.msgText}>
                      {alert.message}
                    </Text>
                  ))}
                </ScrollView>

                <View style={gStyles.divider} />

                <View style={gStyles.timeRow}>
                  <Ionicons name="time-outline" size={14} color="#888" />
                  <Text style={gStyles.timeText}>
                    Triggered: {new Date(first.created_at).toLocaleString('en-PH')}
                  </Text>
                </View>

              </View>

              {/* Acknowledge Button */}
              <TouchableOpacity
                style={[gStyles.actionBtn, gStyles.btnAcknowledge]}
                onPress={handleDismiss}
                activeOpacity={0.9}
              >
                <Ionicons
                  name="checkmark-done-circle"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={gStyles.actionText}>Acknowledge</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDismiss} style={{ marginTop: 14 }}>
                <Text style={gStyles.hintText}>Tap to dismiss</Text>
              </TouchableOpacity>

            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// ─── App Navigator ─────────────────────────────────────────
export default function AppNavigator() {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
      </Stack.Navigator>

      {/* Global alert — floats above all screens */}
      <GlobalCriticalAlert />
    </>
  );
}

// ─── Tab Bar Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderRadius: 35,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 70,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderTopWidth: 0,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarItem:        { justifyContent: 'center', alignItems: 'center' },
  tabBarIcon:        { marginBottom: 0 },
  tabLabel:          { fontSize: 10, fontWeight: '600', marginTop: 2 },
  activeIconWrapper: {
    backgroundColor: '#33b355',
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  inactiveIconWrapper: {
    width: 38, height: 38,
    justifyContent: 'center', alignItems: 'center',
  },
});

// ─── Global Critical Alert Styles ─────────────────────────
const gStyles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  closeBtnCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    transform: [{ translateY: -20 }],
  },
  iconRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  severityPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#ef4444',
  },
  severityText: {
    fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1,
  },
  dashCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxHeight: 280,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceTitle: {
    fontSize: 20, fontWeight: '900', letterSpacing: 0.5,
  },
  teamBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  teamBadgeText: {
    fontSize: 12, fontWeight: '800', color: '#3a6b47',
  },
  divider: {
    height: 1, backgroundColor: '#f0f0f0', marginVertical: 14,
  },
  msgScroll: {
    flexGrow: 0,
  },
  msgText: {
    fontSize: 15, color: '#1e293b', fontWeight: '700',
    lineHeight: 24, marginBottom: 8, textAlign: 'left',
  },
  timeRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, justifyContent: 'center',
  },
  timeText: {
    fontSize: 12, color: '#64748b', fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAcknowledge: {
    backgroundColor: '#10b981',
  },
  actionText: {
    fontSize: 15, color: '#fff', fontWeight: '800', letterSpacing: 0.3,
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});