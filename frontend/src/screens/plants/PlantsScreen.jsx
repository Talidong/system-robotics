// src/screens/plants/PlantsScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, TextInput, Alert, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { getAllPlants, createPlant, deletePlant, updatePlant, getTeamName } from '../../service/plantService';
import { getProfile } from '../../service/userStorage';
import NotificationBell from '../../components/notifications/NotificationBell';

const CLOUDINARY_CLOUD_NAME = 'dhk6qr5is';
const CLOUDINARY_UPLOAD_PRESET = 'Archie 2nd';

const TEAMS = [
  { id: 0, label: 'All' },
  { id: 1, label: 'Team A' },
  { id: 2, label: 'Team B' },
  { id: 3, label: 'Team C' },
  { id: 4, label: 'Team D' },
];

const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Harvest'];
const PLANT_COLORS = ['#4a7c59', '#2196F3', '#FF5722', '#9C27B0'];

export default function PlantsScreen() {
  const navigation = useNavigation();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [userAvatar, setUserAvatar] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [imageUrlModalVisible, setImageUrlModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [updatingImage, setUpdatingImage] = useState(false);

  const [plantName, setPlantName] = useState('');
  const [datePlanted, setDatePlanted] = useState('');
  const [teamId, setTeamId] = useState(1);
  const [growthStage, setGrowthStage] = useState('Seedling');
  const [imageUrl, setImageUrl] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPlants();
      loadUser();
      const loadAvatar = async () => {
        const profile = await getProfile();
        setUserAvatar(profile?.avatar || null);
      };
      loadAvatar();
    }, [])
  );

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        setUserId(user.user_id || null);
        setUserRole(user.role || 'user');
      }
    } catch {}
  };

  const isAdmin = userRole === 'admin';

  const loadPlants = async () => {
    setLoading(true);
    const data = await getAllPlants();
    setPlants(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getAllPlants();
    setPlants(data);
    setRefreshing(false);
  };

  const filteredPlants = selectedTeam === 0
    ? plants
    : plants.filter(p => p.team_id === selectedTeam);

  // ─── Cloudinary Upload ────────────────────────────────────────────────────
  const pickAndUploadImage = async (setterFn, setUploading) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        type: 'image/jpeg',
        name: 'plant.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        setterFn(data.secure_url);
      } else {
        Alert.alert('Upload Failed', data.error?.message || 'Hindi na-upload ang image. Try again.');
      }
    } catch (err) {
      Alert.alert('Upload Failed', 'Hindi na-upload ang image. Check your connection.');
    } finally {
      setUploading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddPlant = async () => {
    if (!plantName.trim() || !datePlanted.trim()) {
      Alert.alert('Error', 'Plant name and date planted are required.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(datePlanted.trim())) {
      Alert.alert('Error', 'Date format must be YYYY-MM-DD (e.g. 2026-05-01)');
      return;
    }
    setSaving(true);
    try {
      await createPlant({
        team_id: teamId,
        user_id: userId,
        plant_name: plantName.trim(),
        date_planted: datePlanted.trim(),
        growth_stage: growthStage,
        image_url: imageUrl.trim() || null,
      });
      Alert.alert('Success', 'Plant added successfully!');
      setModalVisible(false);
      resetForm();
      loadPlants();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add plant.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (plant) => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete "${plant.plant_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlant(plant.plant_id);
              loadPlants();
            } catch {
              Alert.alert('Error', 'Failed to delete plant.');
            }
          },
        },
      ]
    );
  };

  const handleOpenImageModal = (plant) => {
    setSelectedPlant(plant);
    setTempImageUrl(plant.image_url || '');
    setImageUrlModalVisible(true);
  };

  const handleSaveImageUrl = async () => {
    if (!selectedPlant) return;
    setUpdatingImage(true);
    try {
      await updatePlant(selectedPlant.plant_id, {
        team_id: selectedPlant.team_id,
        plant_name: selectedPlant.plant_name,
        date_planted: selectedPlant.date_planted,
        growth_stage: selectedPlant.growth_stage,
        image_url: tempImageUrl.trim() || null,
      });
      setImageUrlModalVisible(false);
      loadPlants();
    } catch {
      Alert.alert('Error', 'Failed to update image.');
    } finally {
      setUpdatingImage(false);
    }
  };

  const resetForm = () => {
    setPlantName('');
    setDatePlanted('');
    setTeamId(1);
    setGrowthStage('Seedling');
    setImageUrl('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.logo} />
          ) : (
            <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          )}
          <View>
            <Text style={styles.headerRole}>{isAdmin ? 'Admin' : 'User'}</Text>
            <Text style={styles.headerTitle}>Plant Management</Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {/* Team Filter */}
      <View style={styles.teamSelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamSelector}
        >
          {TEAMS.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={[styles.teamBtn, selectedTeam === team.id && styles.teamBtnActive]}
              onPress={() => setSelectedTeam(team.id)}
            >
              <Text style={[styles.teamBtnText, selectedTeam === team.id && styles.teamBtnTextActive]}>
                {team.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Plant List */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#4a7c59" />
          <Text style={styles.loadingText}>Loading plants...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a7c59']} />
          }
        >
          {filteredPlants.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <Ionicons name="leaf-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No plants found.</Text>
              {isAdmin && (
                <Text style={styles.emptySubText}>Tap + to add a new plant.</Text>
              )}
            </View>
          ) : (
            filteredPlants.map((plant) => (
            <TouchableOpacity
  key={plant.plant_id}
  style={styles.plantCard}
  onPress={() => {
  if (isAdmin && !plant.image_url) {
    handleOpenImageModal(plant); // ← buksan ang image modal kapag walang image
  } else {
    navigation.navigate('PlantDetail', { plant });
  }
}}
  activeOpacity={0.85}
>
                {plant.image_url ? (
                  <Image
                    source={{ uri: plant.image_url }}
                    style={styles.plantCardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.plantCardImagePlaceholder, { backgroundColor: PLANT_COLORS[((plant.team_id || 1) - 1) % 4] }]}>
                    {isAdmin ? (
                      <>
                        <Ionicons name="camera-outline" size={32} color="#fff" />
                        <Text style={styles.addImageText}>Tap to add image</Text>
                      </>
                    ) : (
                      <Ionicons name="leaf" size={48} color="rgba(255,255,255,0.5)" />
                    )}
                  </View>
                )}

                <View style={styles.plantCardContent}>
                  <View style={styles.plantCardTopRow}>
                    <Text style={styles.plantCardTeam}>
                      {plant.team_name || getTeamName(plant.team_id)}
                    </Text>
                    <View style={styles.stageBadge}>
                      <Text style={styles.stageText}>
                        {plant.growth_stage || 'Seedling'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.plantCardName}>{plant.plant_name}</Text>
                  <View style={styles.plantCardMeta}>
                    <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.plantCardMetaText}>
                      Planted: {plant.date_planted
                        ? new Date(plant.date_planted).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </Text>
                  </View>
                </View>

                {isAdmin && plant.image_url && (
                  <TouchableOpacity
                    style={styles.cameraOverlay}
                    onPress={() => handleOpenImageModal(plant)}
                  >
                    <Ionicons name="camera-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                )}

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.deleteBtnOverlay}
                    onPress={() => handleDelete(plant)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* FAB — admin only */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Plant Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Plant</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Plant Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pechay, Kangkong"
                placeholderTextColor="#bbb"
                value={plantName}
                onChangeText={setPlantName}
              />

              <Text style={styles.inputLabel}>Date Planted (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2026-05-01"
                placeholderTextColor="#bbb"
                value={datePlanted}
                onChangeText={setDatePlanted}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.inputLabel}>Plant Image</Text>
              <TouchableOpacity
                style={[styles.pickImageBtn, uploadingImage && { opacity: 0.6 }]}
                onPress={() => pickAndUploadImage(setImageUrl, setUploadingImage)}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <ActivityIndicator size="small" color="#4a7c59" />
                    <Text style={styles.pickImageBtnText}>Uploading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={20} color="#4a7c59" />
                    <Text style={styles.pickImageBtnText}>
                      {imageUrl ? 'Change Image' : 'Pick from Gallery'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
              ) : null}

              <Text style={[styles.inputLabel, { marginTop: 8 }]}>Or paste Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/plant.jpg"
                placeholderTextColor="#bbb"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Team</Text>
              <View style={styles.optionRow}>
                {TEAMS.filter(t => t.id !== 0).map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[styles.optionBtn, teamId === team.id && styles.optionBtnActive]}
                    onPress={() => setTeamId(team.id)}
                  >
                    <Text style={[styles.optionBtnText, teamId === team.id && styles.optionBtnTextActive]}>
                      {team.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Growth Stage</Text>
              <View style={styles.optionRow}>
                {GROWTH_STAGES.map((stage) => (
                  <TouchableOpacity
                    key={stage}
                    style={[styles.optionBtn, growthStage === stage && styles.optionBtnActive]}
                    onPress={() => setGrowthStage(stage)}
                  >
                    <Text style={[styles.optionBtnText, growthStage === stage && styles.optionBtnTextActive]}>
                      {stage}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.addBtn, (saving || uploadingImage) && { opacity: 0.6 }]}
                onPress={handleAddPlant}
                disabled={saving || uploadingImage}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.addBtnText}>Add Plant</Text>
                }
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image URL Modal */}
      <Modal
        visible={imageUrlModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setImageUrlModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Plant Image</Text>
              <TouchableOpacity onPress={() => setImageUrlModalVisible(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.pickImageBtn, updatingImage && { opacity: 0.6 }]}
              onPress={() => pickAndUploadImage(setTempImageUrl, setUpdatingImage)}
              disabled={updatingImage}
            >
              {updatingImage ? (
                <>
                  <ActivityIndicator size="small" color="#4a7c59" />
                  <Text style={styles.pickImageBtnText}>Uploading...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="image-outline" size={20} color="#4a7c59" />
                  <Text style={styles.pickImageBtnText}>Pick from Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { textAlign: 'center', color: '#bbb', marginTop: 14 }]}>— or paste URL —</Text>

            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/plant.jpg"
              placeholderTextColor="#bbb"
              value={tempImageUrl}
              onChangeText={setTempImageUrl}
              autoCapitalize="none"
            />

            {tempImageUrl ? (
              <Image source={{ uri: tempImageUrl }} style={styles.imagePreview} resizeMode="cover" />
            ) : null}

            <TouchableOpacity
              style={[styles.addBtn, { marginTop: 16 }, updatingImage && { opacity: 0.6 }]}
              onPress={handleSaveImageUrl}
              disabled={updatingImage}
            >
              {updatingImage
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.addBtnText}>Save Image</Text>
              }
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF4BE' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 18 },
  headerRole: { fontSize: 11, color: '#666' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  teamSelectorWrapper: {
    backgroundColor: '#fff', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  teamSelector: { paddingHorizontal: 16, gap: 8 },
  teamBtn: {
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f0f0f0',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  teamBtnActive: { backgroundColor: '#4a7c59', borderColor: '#4a7c59' },
  teamBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  teamBtnTextActive: { color: '#fff' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: '#888' },
  listContent: { padding: 16 },
  emptyWrapper: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#bbb' },
  emptySubText: { fontSize: 13, color: '#ccc' },
  plantCard: {
    borderRadius: 18, marginBottom: 16, height: 200,
    overflow: 'hidden', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, position: 'relative',
  },
  plantCardImage: { width: '100%', height: '100%', position: 'absolute' },
  plantCardImagePlaceholder: {
    width: '100%', height: '100%', position: 'absolute',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  plantCardContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  plantCardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  plantCardTeam: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  plantCardName: {
    fontSize: 22, fontWeight: '800', color: '#fff',
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  plantCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  plantCardMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  stageBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
    borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  stageText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  addImageText: { fontSize: 12, color: '#fff', fontWeight: '600', marginTop: 4 },
  cameraOverlay: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 18, padding: 8,
  },
  deleteBtnOverlay: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#E53935', borderRadius: 18, padding: 8, elevation: 3,
  },
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#4a7c59', justifyContent: 'center',
    alignItems: 'center', elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#333', backgroundColor: '#fafafa',
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f0f0f0',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  optionBtnActive: { backgroundColor: '#4a7c59', borderColor: '#4a7c59' },
  optionBtnText: { fontSize: 12, fontWeight: '600', color: '#666' },
  optionBtnTextActive: { color: '#fff' },
  addBtn: {
    backgroundColor: '#3a6b47', marginTop: 24,
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  pickImageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#4a7c59', borderStyle: 'dashed',
    backgroundColor: 'rgba(74, 124, 89, 0.05)',
  },
  pickImageBtnText: { fontSize: 14, fontWeight: '600', color: '#4a7c59' },
  imagePreview: { width: '100%', height: 150, borderRadius: 10, marginTop: 12 },
});