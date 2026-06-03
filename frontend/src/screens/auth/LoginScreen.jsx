// src/screens/auth/LoginScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProfile } from '../../service/userStorage';

const API_URL = 'https://dhydroquack-backend.onrender.com';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Something went wrong.');
        return;
      }

      const authUser = data.user || {};

      // I-save ang token, role, team_id
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify({
        ...authUser,
        token: data.token,
      }));

      await saveProfile({
        displayName: authUser.full_name || email.split('@')[0],
        username: email.split('@')[0],
        email: authUser.email || email,
        avatar: authUser.profile_pic ?? null,
        role: authUser.role,
        team_id: authUser.team_id,
        password,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server. Check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image source={require('../../assets/DHydroQuackLogo 1.png')} style={styles.logo} />
          <Text style={styles.appName}>D-HydroQuack</Text>
          <Text style={styles.tagline}>Future-Ready Smart Vege Farming</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome back!</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#bbb"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7e8',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },

  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3a6b47',
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },

  formSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#333',
  },

  eyeIcon: {
    padding: 4,
  },

  loginBtn: {
    backgroundColor: '#3a6b47',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  loginBtnDisabled: {
    opacity: 0.6,
  },

  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  registerText: {
    fontSize: 13,
    color: '#999',
  },

  registerLink: {
    fontSize: 13,
    color: '#4a7c59',
    fontWeight: '700',
  },
});