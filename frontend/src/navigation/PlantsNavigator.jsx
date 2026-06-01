// src/navigation/PlantsNavigator.jsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlantsScreen from '../screens/plants/PlantsScreen';
import PlantDetailScreen from '../screens/plants/PlantDetailScreen';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const Stack = createNativeStackNavigator();

export default function PlantsNavigator() {
    const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlantsList" component={PlantsScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
    </Stack.Navigator>
  );
}