/**
 * Pipeline screen — shows one MetricTile per lead status with count.
 * Tapping a tile navigates to the Inbox with that status filter pre-applied
 * via a query param: /?filter=STATUS
 */
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';
import { useLeads } from '@/features/leads/LeadsContext';
import type { LeadStatus } from '@/features/leads/types';

import { ScreenHeader } from '@/components/leads/ScreenHeader';

// ---------------------------------------------------------------------------
// Pipeline stage definitions
// ---------------------------------------------------------------------------

const PIPELINE_STAGES: { status: LeadStatus; label: string; description: string }[] = [
  { status: 'NEW', label: 'New', description: 'Just received — not yet actioned' },
  { status: 'CONTACTED', label: 'Contacted', description: 'First contact made' },
  { status: 'QUALIFIED', label: 'Qualified', description: 'Confirmed as a genuine prospect' },
  { status: 'CONVERTED', label: 'Converted', description: 'Became a customer' },
  { status: 'LOST', label: 'Lost', description: 'No longer being pursued' },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PipelineScreen() {
  const { leads } = useLeads();

  function countByStatus(status: LeadStatus): number {
    return leads.filter((l) => l.status === status).length;
  }

  function handleTilePress(status: LeadStatus) {
    router.push(`/?filter=${status}`);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Pipeline" subtitle={`${leads.length} total leads`} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>TAP A STAGE TO FILTER THE INBOX</Text>

        {PIPELINE_STAGES.map((stage) => {
          const count = countByStatus(stage.status);
          return (
            <Pressable
              key={stage.status}
              onPress={() => handleTilePress(stage.status)}
              accessibilityRole="button"
              accessibilityLabel={`${stage.label}: ${count} leads`}
              style={({ pressed }) => [styles.stageTile, pressed && styles.pressed]}>
              <View style={styles.stageLeft}>
                <Text style={styles.stageLabel}>{stage.label}</Text>
                <Text style={styles.stageDesc}>{stage.description}</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            </Pressable>
          );
        })}

        {/* Conversion summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Conversion</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {leads.filter((l) => l.status === 'CONVERTED').length}
              </Text>
              <Text style={styles.summaryLabel}>Converted</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, styles.summaryValueLost]}>
                {leads.filter((l) => l.status === 'LOST').length}
              </Text>
              <Text style={styles.summaryLabel}>Lost</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{leads.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LeadPulseColors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.threeHalf,
    paddingBottom: Spacing.five,
  },
  sectionLabel: {
    ...Typography.sectionLabel,
    color: LeadPulseColors.textMuted,
    marginBottom: Spacing.twoHalf,
    marginTop: Spacing.two,
  },
  stageTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    borderLeftWidth: 3,
    borderLeftColor: LeadPulseColors.surfaceAccentBorder,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.twoHalf,
    marginBottom: Spacing.two,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.75,
  },
  stageLeft: {
    flex: 1,
  },
  stageLabel: {
    ...Typography.leadName,
    color: LeadPulseColors.textPrimary,
    marginBottom: 2,
  },
  stageDesc: {
    ...Typography.metaValue,
    color: LeadPulseColors.textMuted,
  },
  countBadge: {
    backgroundColor: LeadPulseColors.background,
    borderRadius: Radius.full,
    minWidth: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    paddingHorizontal: Spacing.two,
    marginLeft: Spacing.two,
  },
  countText: {
    fontSize: 18,
    fontWeight: '700',
    color: LeadPulseColors.accentBlue,
  },
  summaryCard: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  summaryTitle: {
    ...Typography.sectionLabel,
    color: LeadPulseColors.textMuted,
    marginBottom: Spacing.twoHalf,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: LeadPulseColors.surfaceBorder,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: LeadPulseColors.connectedGreen,
  },
  summaryValueLost: {
    color: LeadPulseColors.errorRed,
  },
  summaryLabel: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
    marginTop: 2,
  },
});
