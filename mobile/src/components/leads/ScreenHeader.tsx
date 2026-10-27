/**
 * ScreenHeader — reusable screen title with optional subtitle and right slot.
 * Used by all LeadPulse screens in place of the Expo Router default header.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LeadPulseColors, Spacing, Typography } from '@/constants/leadpulse-theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.threeHalf,
    paddingVertical: Spacing.two,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    ...Typography.screenTitle,
    color: LeadPulseColors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: LeadPulseColors.textMuted,
    marginTop: 2,
  },
  right: {
    marginLeft: Spacing.two,
  },
});
