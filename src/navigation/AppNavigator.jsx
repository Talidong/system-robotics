// src/navigation/AppNavigator.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AccountNavigator from './AccountNavigator';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen'; // ← dagdag
const Tab = createBottomTabNavigator();

function DashboardScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Dashboard</Text>
    </View>
  );
}


function ControlScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Control</Text>
    </View>
  );
}

function PlantsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Plants</Text>
    </View>
  );
}



export default function AppNavigator() {
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
      <Tab.Screen name="Plants" component={PlantsScreen} />
      <Tab.Screen name="Account" component={AccountNavigator} />
    </Tab.Navigator>
  );
}

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
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarIcon: {
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconWrapper: {
    backgroundColor: '#33b355',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIconWrapper: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7e8',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a7c59',
  },
});