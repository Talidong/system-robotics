// src/components/account/ResendCodeTimer.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ResendCodeTimer({ onResend, initialSeconds = 90 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    if (!canResend) return;
    setSeconds(initialSeconds);
    setCanResend(false);
    onResend();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Didn't receive a code? </Text>
      <TouchableOpacity onPress={handleResend} disabled={!canResend}>
        <Text style={[styles.resend, canResend && styles.resendActive]}>
          Resend Code {!canResend && `(${formatTime(seconds)})`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  text: { fontSize: 13, color: '#666' },
  resend: { fontSize: 13, color: '#bbb', fontWeight: '600' },
  resendActive: { color: '#4a7c59' },
});