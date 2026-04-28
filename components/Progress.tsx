import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressProps {
  value: number; // 0-100
  style?: any;
}

export const Progress: React.FC<ProgressProps> = ({ value, style }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.bar, { width: `${clampedValue}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
});
