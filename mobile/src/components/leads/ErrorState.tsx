/**
 * ErrorState — error message with an optional retry button.
 * Used when the connection fails and no leads are available.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.threeHalf,
    paddingVertical: Spacing.five,
  },
  card: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: LeadPulseColors.errorRed,
    borderLeftWidth: 3,
    padding: Spacing.three,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    ...Typography.leadName,
    color: LeadPulseColors.errorRed,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: LeadPulseColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: Spacing.twoHalf,
    backgroundColor: LeadPulseColors.errorRed,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
  retryText: {
    color: '#ffffff',
    ...Typography.metaLabel,
  },
});
