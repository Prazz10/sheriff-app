import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  style?: any;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheckedChange, style }) => {
  return (
    <TouchableOpacity
      onPress={() => onCheckedChange(!checked)}
      style={[styles.container, checked && styles.checked, style]}
      activeOpacity={0.7}
    >
      {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
});
