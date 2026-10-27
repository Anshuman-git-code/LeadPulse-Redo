/**
 * EmptyState — centered message shown when a list has no items.
 * Accepts an optional CTA button (e.g. "Clear filters").
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';

interface EmptyStateProps {
  title: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ title, message, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {ctaLabel && onCta ? (
        <Pressable
          onPress={onCta}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  title: {
    ...Typography.leadName,
    color: LeadPulseColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  message: {
    ...Typography.body,
    color: LeadPulseColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    marginTop: Spacing.three,
    backgroundColor: LeadPulseColors.accentBlue,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
  ctaText: {
    color: '#ffffff',
    ...Typography.metaLabel,
  },
});
