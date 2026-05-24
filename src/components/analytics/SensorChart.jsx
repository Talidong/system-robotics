// src/components/analytics/SensorChart.jsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;



export default function SensorChart({ title, labels, data, color, unit }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data, color: () => color, strokeWidth: 2 }],
        }}
        width={screenWidth - 48}
        height={160}
        yAxisSuffix={unit}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0,0,0,${opacity * 0.3})`,
          labelColor: () => '#888',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: color,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
});