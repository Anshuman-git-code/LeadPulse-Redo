/**
 * FilterChip — pressable toggle chip with active/inactive state.
 * Active: accentBlue background, white text.
 * Inactive: surface background, textMuted text.
 */
import { Pressable, StyleSheet, Text } from 'react-native';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.one,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: LeadPulseColors.accentBlue,
    borderColor: LeadPulseColors.accentBlue,
  },
  chipInactive: {
    backgroundColor: LeadPulseColors.surface,
    borderColor: LeadPulseColors.surfaceBorder,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    ...Typography.statusPill,
  },
  labelActive: {
    color: '#ffffff',
  },
  labelInactive: {
    color: LeadPulseColors.textMuted,
  },
});
