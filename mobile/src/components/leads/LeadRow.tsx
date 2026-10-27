/**
 * LeadRow — single lead row for use in a FlatList.
 * Shows: initials avatar, name, source badge, status pill, email, timestamp.
 * Entire row is pressable and navigates to the lead detail screen.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';
import type { Lead } from '@/features/leads/types';

import { StatusPill } from './StatusPill';

const SOURCE_LABELS: Record<string, string> = {
  META_LEAD_ADS: 'Meta Ads',
  TEST: 'Test',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface LeadRowProps {
  lead: Lead;
  onPress: (lead: Lead) => void;
}

export function LeadRow({ lead, onPress }: LeadRowProps) {
  const initials = getInitials(lead.name || '?');
  const sourceLabel = SOURCE_LABELS[lead.source] ?? lead.source;
  const timeAgo = formatRelativeTime(lead.createdAt);

  return (
    <Pressable
      onPress={() => onPress(lead)}
      accessibilityRole="button"
      accessibilityLabel={lead.name}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {/* Left accent border */}
      <View style={styles.accentBar} />

      {/* Initials avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Top row: name + status pill */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {lead.name || 'Unknown'}
          </Text>
          <StatusPill status={lead.status} size="sm" />
        </View>

        {/* Email */}
        <Text style={styles.email} numberOfLines={1}>
          {lead.email || 'No email'}
        </Text>

        {/* Bottom row: source badge + timestamp */}
        <View style={styles.bottomRow}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>{sourceLabel}</Text>
          </View>
          <Text style={styles.timestamp}>{timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.threeHalf,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: LeadPulseColors.surfaceAccentBorder,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: LeadPulseColors.surfaceAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.twoHalf,
    flexShrink: 0,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingVertical: Spacing.twoHalf,
    paddingHorizontal: Spacing.twoHalf,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    ...Typography.leadName,
    color: LeadPulseColors.textPrimary,
    flex: 1,
  },
  email: {
    ...Typography.metaValue,
    color: LeadPulseColors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sourceBadge: {
    backgroundColor: LeadPulseColors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
  },
  sourceText: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
  },
  timestamp: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
  },
});
