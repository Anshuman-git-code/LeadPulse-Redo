/**
 * Inbox — LeadPulse home screen.
 *
 * Shows a live lead list, metric summary, search, and status filters.
 * Tap a lead row to navigate to the detail screen.
 *
 * Data flows from LeadsContext, which initialises from synthetic sample data
 * and updates in real-time via Socket.IO when the backend is reachable.
 *
 * Screen manages its own header (headerShown: false in app-tabs.tsx).
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeadPulseColors, Spacing, Typography } from '@/constants/leadpulse-theme';
import { useLeads } from '@/features/leads/LeadsContext';
import type { Lead, LeadStatus } from '@/features/leads/types';

import { EmptyState } from '@/components/leads/EmptyState';
import { FilterChip } from '@/components/leads/FilterChip';
import { LeadRow } from '@/components/leads/LeadRow';
import { MetricTile } from '@/components/leads/MetricTile';
import { SearchBar } from '@/components/leads/SearchBar';

// ---------------------------------------------------------------------------
// Filter and sort options
// ---------------------------------------------------------------------------

type FilterKey = 'ALL' | LeadStatus | 'FOLLOW_UP';
type SortOrder = 'newest' | 'oldest';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'FOLLOW_UP', label: 'Follow-up' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'LOST', label: 'Lost' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFollowUpDue(lead: Lead): boolean {
  if (!lead.followUpAt) return false;
  return new Date(lead.followUpAt).getTime() <= Date.now() + 24 * 3600_000; // due within 24 h
}

function matchesSearch(lead: Lead, query: string): boolean {
  const q = query.toLowerCase();
  return (
    lead.name.toLowerCase().includes(q) ||
    lead.email.toLowerCase().includes(q) ||
    lead.phone.toLowerCase().includes(q)
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function InboxScreen() {
  const { leads, connectionStatus, dataMode } = useLeads();
  const params = useLocalSearchParams<{ filter?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  // Derive initial filter from pipeline navigation param (e.g. ?filter=NEW).
  // Computed once on mount from params; subsequent changes handled by the
  // FilterChip onPress handlers directly.
  const [activeFilter, setActiveFilter] = useState<FilterKey>(() => {
    if (params.filter) {
      const f = params.filter as FilterKey;
      if (FILTER_OPTIONS.some((o) => o.key === f)) return f;
    }
    return 'ALL';
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const hasRenderedRef = useRef(false);

  // Apply initial filter from pipeline navigation (e.g. ?filter=NEW)
  // This effect handles navigating back to the inbox from pipeline multiple times.
  useEffect(() => {
    if (params.filter) {
      const f = params.filter as FilterKey;
      const valid = FILTER_OPTIONS.some((o) => o.key === f);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (valid) setActiveFilter(f);
    }
  }, [params.filter]);

  // Brief loading state on mount — dismiss after first data is available
  useEffect(() => {
    if (leads.length > 0 && !hasRenderedRef.current) {
      hasRenderedRef.current = true;
      setIsLoading(false);
    } else if (!hasRenderedRef.current) {
      // No leads yet — dismiss spinner after a short timeout
      const t = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(t);
    }
  }, [leads]);

  // ---------------------------------------------------------------------------
  // Derived metrics (all from live data — no hard-coded numbers)
  // ---------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const followUpsDue = leads.filter(isFollowUpDue).length;
    const newCount = leads.filter((l) => l.status === 'NEW').length;
    const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;
    return { total: leads.length, newCount, followUpsDue, convertedCount };
  }, [leads]);

  // ---------------------------------------------------------------------------
  // Filtered + searched list (sorted by sortOrder)
  // ---------------------------------------------------------------------------
  const filteredLeads = useMemo(() => {
    let result = [...leads].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === 'newest' ? diff : -diff;
    });

    if (activeFilter !== 'ALL') {
      if (activeFilter === 'FOLLOW_UP') {
        result = result.filter(isFollowUpDue);
      } else {
        result = result.filter((l) => l.status === activeFilter);
      }
    }

    if (searchQuery.trim()) {
      result = result.filter((l) => matchesSearch(l, searchQuery.trim()));
    }

    return result;
  }, [leads, activeFilter, searchQuery, sortOrder]);

  // ---------------------------------------------------------------------------
  // Connection status dot
  // ---------------------------------------------------------------------------
  const isConnected = connectionStatus === 'Connected to backend';
  const isConnecting = connectionStatus === 'Connecting…';

  function handleLeadPress(lead: Lead) {
    router.push(`/leads/${lead.id}`);
  }

  function handleClearFilters() {
    setSearchQuery('');
    setActiveFilter('ALL');
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>LeadPulse</Text>
            {dataMode === 'mock' ? (
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>Demo</Text>
              </View>
            ) : null}
          </View>
          {/* Connection status dot */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                isConnected
                  ? styles.dotConnected
                  : isConnecting
                    ? styles.dotConnecting
                    : styles.dotDisconnected,
              ]}
            />
            {isConnecting ? (
              <ActivityIndicator size="small" color={LeadPulseColors.accentBlue} style={styles.spinner} />
            ) : null}
            <Text style={styles.statusText} numberOfLines={1}>
              {isConnected ? 'Live' : isConnecting ? 'Connecting…' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* ── Metric tiles ── */}
        <View style={styles.metricsRow}>
          <MetricTile label="Total" value={metrics.total} />
          <MetricTile label="New" value={metrics.newCount} highlight />
          <MetricTile label="Follow-ups" value={metrics.followUpsDue} />
          <MetricTile label="Converted" value={metrics.convertedCount} />
        </View>

        {/* ── Search ── */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, email, phone…"
          />
        </View>

        {/* ── Filter chips + sort toggle ── */}
        <View style={styles.filterSortRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            keyboardShouldPersistTaps="handled"
            style={styles.filterScroll}>
            {FILTER_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.key}
                label={opt.label}
                active={activeFilter === opt.key}
                onPress={() => setActiveFilter(opt.key)}
              />
            ))}
          </ScrollView>
          <Pressable
            onPress={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
            style={({ pressed }) => [styles.sortBtn, pressed && styles.sortBtnPressed]}>
            <Text style={styles.sortBtnText}>
              {sortOrder === 'newest' ? '↓ New' : '↑ Old'}
            </Text>
          </Pressable>
        </View>

        {/* ── Lead list ── */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={LeadPulseColors.accentBlue} />
            <Text style={styles.loadingText}>Loading leads…</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLeads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LeadRow lead={item} onPress={handleLeadPress} />}
            keyboardDismissMode="on-drag"
            contentContainerStyle={
              filteredLeads.length === 0 ? styles.emptyListContent : styles.listContent
            }
            ListHeaderComponent={
              <Text style={styles.sectionLabel}>
                {activeFilter === 'ALL' ? 'ALL LEADS' : activeFilter.replace('_', ' ')} ·{' '}
                {filteredLeads.length} · {sortOrder === 'newest' ? 'NEWEST FIRST' : 'OLDEST FIRST'}
              </Text>
            }
            ListEmptyComponent={
              searchQuery || activeFilter !== 'ALL' ? (
                <EmptyState
                  title="No results"
                  message="No leads match your current search or filter."
                  ctaLabel="Clear filters"
                  onCta={handleClearFilters}
                />
              ) : (
                <EmptyState
                  title="No leads yet"
                  message="Send a test lead to see it appear here automatically."
                />
              )
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles — token-based, no hard-coded hex strings
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LeadPulseColors.background,
  },
  flex: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.threeHalf,
    paddingVertical: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  appName: {
    ...Typography.screenTitle,
    color: LeadPulseColors.textPrimary,
  },
  demoBadge: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: LeadPulseColors.accentBlue,
  },
  demoBadgeText: {
    ...Typography.timestamp,
    color: LeadPulseColors.accentBlue,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: LeadPulseColors.connectedGreen,
  },
  dotConnecting: {
    backgroundColor: LeadPulseColors.accentBlue,
  },
  dotDisconnected: {
    backgroundColor: LeadPulseColors.errorRed,
  },
  spinner: {
    transform: [{ scale: 0.6 }],
  },
  statusText: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
    maxWidth: 80,
  },
  // Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.threeHalf,
    marginBottom: Spacing.twoHalf,
  },
  // Search
  searchContainer: {
    marginBottom: Spacing.two,
  },
  // Filter chips + sort
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  filterScroll: {
    flex: 1,
  },
  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.threeHalf,
    paddingBottom: Spacing.twoHalf,
  },
  // Sort toggle button
  sortBtn: {
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.two,
    marginRight: Spacing.twoHalf,
    marginBottom: Spacing.twoHalf,
    backgroundColor: LeadPulseColors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
  },
  sortBtnPressed: {
    opacity: 0.7,
  },
  sortBtnText: {
    ...Typography.timestamp,
    color: LeadPulseColors.accentBlue,
    fontWeight: '600',
  },
  // Section label
  sectionLabel: {
    ...Typography.sectionLabel,
    color: LeadPulseColors.textMuted,
    paddingHorizontal: Spacing.threeHalf,
    paddingBottom: Spacing.two,
    paddingTop: Spacing.two,
  },
  // List
  listContent: {
    paddingBottom: Spacing.five,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.twoHalf,
  },
  loadingText: {
    ...Typography.body,
    color: LeadPulseColors.textMuted,
  },
});
