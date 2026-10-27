/**
 * StatusPill — colored chip that shows a lead's status as both a text label
 * and a background color. Text label is always rendered so status is not
 * conveyed by color alone (WCAG 1.4.1).
 */
import { StyleSheet, Text, View } from 'react-native';

import { Radius, StatusColors, Typography } from '@/constants/leadpulse-theme';
import type { LeadStatus } from '@/features/leads/types';

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

interface StatusPillProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const label = STATUS_LABELS[status];
  const colors = StatusColors[status];
  const isSmall = size === 'sm';

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.pill,
        { backgroundColor: colors.background },
        isSmall && styles.pillSm,
      ]}>
      <Text
        style={[
          styles.label,
          { color: colors.text },
          isSmall && styles.labelSm,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  pillSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  label: {
    ...Typography.statusPill,
  },
  labelSm: {
    fontSize: 10,
  },
});
