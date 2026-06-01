// src/components/analytics/SensorChart.jsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function SensorChart({ title, labels, data, color, unit }) {
  if (!labels?.length || !data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Show max 6 labels to avoid overlap — pick evenly spaced
  const maxLabels = 6;
  const step = Math.ceil(labels.length / maxLabels);
  const filteredLabels = labels.map((label, i) =>
    i % step === 0 ? label : ''
  );

  // Compute smart decimal places — integers for whole numbers
  const hasDecimals = data.some(v => v % 1 !== 0);
  const decimalPlaces = hasDecimals ? 1 : 0;

  return (
    <View>
      <LineChart
        data={{
          labels: filteredLabels,
          datasets: [
            {
              data,
              color: () => color,
              strokeWidth: 2.5,
            },
          ],
        }}
        width={screenWidth - 80}
        height={180}
        yAxisSuffix={unit}
        fromZero={false}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces,
          color: (opacity = 1) => `rgba(0,0,0,${opacity * 0.15})`,
          labelColor: () => '#999',
          style: { borderRadius: 8 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: color,
            fill: '#fff',
          },
          propsForBackgroundLines: {
            strokeDasharray: '4',
            stroke: 'rgba(0,0,0,0.06)',
          },
          propsForLabels: {
            fontSize: 10,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    borderRadius: 8,
    marginLeft: -10,
  },
  empty: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#bbb',
  },
});