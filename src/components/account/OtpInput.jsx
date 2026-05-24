// src/components/account/OtpInput.jsx
import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function OtpInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    if (newOtp.every(v => v !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => (inputs.current[index] = ref)}
          style={styles.box}
          value={digit}
          onChangeText={text => handleChange(text.slice(-1), index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, marginVertical: 24 },
  box: {
    width: 46, height: 52, borderWidth: 1.5,
    borderColor: '#4a7c59', borderRadius: 8,
    fontSize: 20, fontWeight: '700', color: '#333',
    backgroundColor: '#fff',
  },
});