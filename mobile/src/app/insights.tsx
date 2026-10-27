/**
 * Insights screen — aggregate metrics derived from LeadsContext data.
 *
 * All values are computed from the current leads array — no hard-coded numbers.
 * A "session data only" subtitle makes clear that data resets on app restart.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';
import { useLeads } from '@/features/leads/LeadsContext';

import { MetricTile } from '@/components/leads/MetricTile';
import { ScreenHeader } from '@/components/leads/ScreenHeader';

function isFollowUpDue(followUpAt?: string): boolean {
  if (!followUpAt) return false;
  return new Date(followUpAt).getTime() <= Date.now() + 24 * 3600_000;
}

export default function InsightsScreen() {
  const { leads, dataMode } = useLeads();

  // Derived metrics — all from live context
  const total = leads.length;
  const newCount = leads.filter((l) => l.status === 'NEW').length;
  const contactedCount = leads.filter((l) => l.status === 'CONTACTED').length;
  const qualifiedCount = leads.filter((l) => l.status === 'QUALIFIED').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;
  const lostCount = leads.filter((l) => l.status === 'LOST').length;
  const followUpsDue = leads.filter((l) => isFollowUpDue(l.followUpAt)).length;
  const conversionRate =
    total > 0 ? Math.round((convertedCount / total) * 100) : 0;

  const dataLabel = dataMode === 'mock' ? 'Session data only (demo)' : 'Session data only';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Insights" subtitle={dataLabel} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Summary */}
        <Text style={styles.sectionLabel}>OVERVIEW</Text>
        <View style={styles.tilesRow}>
          <MetricTile label="Total" value={total} />
          <MetricTile label="New" value={newCount} highlight />
        </View>
        <View style={styles.tilesRow}>
          <MetricTile label="Follow-ups Due" value={followUpsDue} highlight />
          <MetricTile label="Conversion" value={`${conversionRate}%`} />
        </View>

        {/* By status */}
        <Text style={styles.sectionLabel}>BY STATUS</Text>
        <View style={styles.tilesRow}>
          <MetricTile label="New" value={newCount} />
          <MetricTile label="Contacted" value={contactedCount} />
        </View>
        <View style={styles.tilesRow}>
          <MetricTile label="Qualified" value={qualifiedCount} />
          <MetricTile label="Converted" value={convertedCount} />
        </View>
        <View style={styles.tilesRow}>
          <MetricTile label="Lost" value={lostCount} />
          <View style={styles.tileSpacer} />
        </View>

        {/* Source breakdown */}
        <Text style={styles.sectionLabel}>BY SOURCE</Text>
        <View style={styles.tilesRow}>
          <MetricTile
            label="Meta Ads"
            value={leads.filter((l) => l.source === 'META_LEAD_ADS').length}
          />
          <MetricTile
            label="Test"
            value={leads.filter((l) => l.source === 'TEST').length}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            Metrics reflect in-memory session data only. All values reset on app restart.
            Persistent reporting will be available after the API integration phase.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginTop: Spacing.three,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  tileSpacer: {
    flex: 1,
  },
  disclaimerCard: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    padding: Spacing.twoHalf,
    marginTop: Spacing.two,
  },
  disclaimerText: {
    ...Typography.body,
    color: LeadPulseColors.textMuted,
    lineHeight: 22,
  },
});
