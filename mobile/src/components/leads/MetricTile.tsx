/**
 * MetricTile — compact count/label tile used in Inbox header and Insights screen.
 * When highlight=true, the value is rendered in accentBlue.
 */
import { StyleSheet, Text, View } from 'react-native';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';

interface MetricTileProps {
  label: string;
  value: number | string;
  highlight?: boolean;
}

export function MetricTile({ label, value, highlight = false }: MetricTileProps) {
  return (
    <View style={styles.tile}>
      <Text
        style={[
          styles.value,
          highlight && styles.valueHighlight,
        ]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    minWidth: 64,
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: LeadPulseColors.textPrimary,
    lineHeight: 28,
  },
  valueHighlight: {
    color: LeadPulseColors.accentBlue,
  },
  label: {
    ...Typography.sectionLabel,
    color: LeadPulseColors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
