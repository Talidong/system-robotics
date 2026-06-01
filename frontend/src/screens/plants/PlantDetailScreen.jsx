// src/screens/plants/PlantDetailScreen.jsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPlantData, getDaysLeft, getHarvestProgress } from '../../constants/plantData';

const TEAM_NAMES = { 1: 'Team A', 2: 'Team B', 3: 'Team C', 4: 'Team D' };
const PLANT_COLORS = ['#4a7c59', '#2196F3', '#FF5722', '#9C27B0'];

export default function PlantDetailScreen({ route, navigation }) {
  const { plant } = route.params;

  const plantData = getPlantData(plant.plant_name);
  const daysLeft = plantData ? getDaysLeft(plant.date_planted, plantData.harvestDays) : null;
  const progress = plantData ? getHarvestProgress(plant.date_planted, plantData.harvestDays) : 0;
  const teamName = plant.team_name || TEAM_NAMES[plant.team_id] || `Team ${plant.team_id}`;
  const accentColor = PLANT_COLORS[((plant.team_id || 1) - 1) % 4];

  const formattedDate = plant.date_planted
    ? new Date(plant.date_planted).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <SafeAreaView style={styles.container}>
      {/* Plant Image / Header */}
      <View style={styles.imageWrapper}>
        {plant.image_url ? (
          <Image source={{ uri: plant.image_url }} style={styles.plantImage} resizeMode="cover" />
        ) : (
          <View style={[styles.plantImagePlaceholder, { backgroundColor: accentColor }]}>
            <Ionicons name="leaf" size={64} color="rgba(255,255,255,0.4)" />
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Days left badge */}
        {daysLeft !== null && (
          <View style={styles.daysLeftBadge}>
            <Text style={styles.daysLeftText}>
              {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Harvest today!' : 'Ready to harvest!'}
            </Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.teamLabel}>{teamName} — {plant.plant_name?.toUpperCase()}</Text>
        <Text style={styles.plantCommonName}>
          {plantData?.commonName || plant.plant_name}
        </Text>

        {/* Description */}
        {plantData?.description && (
          <Text style={styles.description}>{plantData.description}</Text>
        )}

        {/* Date Planted + Growth Stage */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Date planted</Text>
            <Text style={styles.infoCardValue}>{formattedDate}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Growth stage</Text>
            <Text style={styles.infoCardValue}>{plant.growth_stage || 'Seedling'}</Text>
          </View>
        </View>

        {/* Watering Schedule */}
        {plantData?.wateringTimes && (
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleLabel}>
              Watering schedule — {plantData.wateringSchedule}
            </Text>
            <View style={styles.scheduleTimesRow}>
              {plantData.wateringTimes.map((time, index) => (
                <View
                  key={index}
                  style={[
                    styles.timeChip,
                    index === 2 && { backgroundColor: accentColor },
                  ]}
                >
                  <Text style={[
                    styles.timeChipText,
                    index === 2 && { color: '#fff' },
                  ]}>
                    {time}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Harvest Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Harvest progress</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: accentColor }]} />
          </View>
        </View>

        {/* Back button */}
        <TouchableOpacity style={[styles.backToListBtn, { backgroundColor: accentColor }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backToListBtnText}>Back to plants</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF4BE' },

  // Image header
  imageWrapper: { width: '100%', height: 220, position: 'relative' },
  plantImage: { width: '100%', height: '100%' },
  plantImagePlaceholder: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20, padding: 8,
  },
  daysLeftBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  daysLeftText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Content
  content: { padding: 20 },
  teamLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 4 },
  plantCommonName: {
    fontSize: 22, fontWeight: '800', color: '#222',
    marginBottom: 12,
  },
  description: {
    fontSize: 14, color: '#555', lineHeight: 22,
    marginBottom: 20, textAlign: 'center',
  },

  // Info cards
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoCard: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 12, padding: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  infoCardLabel: { fontSize: 11, color: '#aaa', marginBottom: 4 },
  infoCardValue: { fontSize: 15, fontWeight: '700', color: '#222' },

  // Watering schedule
  scheduleCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 16,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  scheduleLabel: { fontSize: 12, color: '#aaa', marginBottom: 12 },
  scheduleTimesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: '#f5f5f5',
  },
  timeChipText: { fontSize: 13, fontWeight: '600', color: '#333' },

  // Progress
  progressCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 20,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, color: '#aaa' },
  progressPercent: { fontSize: 13, fontWeight: '700', color: '#333' },
  progressBarBg: {
    height: 10, backgroundColor: '#f0f0f0',
    borderRadius: 5, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },

  // Back button
  backToListBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  backToListBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});