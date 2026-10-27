/**
 * Lead Detail screen — shows full lead information and allows local mutations.
 *
 * Features:
 * - Status picker (FilterChip row) — calls updateLeadStatus from context
 * - Quick-action buttons: email and phone via Linking
 * - Notes section: existing notes list + add-note input
 * - Follow-up date: smart text input that accepts ISO dates, YYYY-MM-DD, and
 *   natural keywords (today, tomorrow, next week). Validates input and shows
 *   clear feedback. A native DatePicker is deferred — it requires
 *   @react-native-community/datetimepicker which needs a dev build.
 * - Activity timeline: newest-first log of all events
 *
 * All mutations are local-only and reset on app restart (this phase).
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LeadPulseColors,
  Radius,
  Spacing,
  Typography,
} from '@/constants/leadpulse-theme';
import { useLeads } from '@/features/leads/LeadsContext';
import type { LeadStatus } from '@/features/leads/types';

import { FilterChip } from '@/components/leads/FilterChip';
import { StatusPill } from '@/components/leads/StatusPill';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

const SOURCE_LABELS: Record<string, string> = {
  META_LEAD_ADS: 'Meta Ads',
  TEST: 'Test',
};

function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString;
  }
}

/**
 * Parses a user-entered follow-up date string.
 * Accepts:
 *   - Natural keywords: "today", "tomorrow", "next week"
 *   - YYYY-MM-DD  (e.g. 2025-12-31)
 *   - ISO 8601    (e.g. 2025-12-31T10:00:00.000Z)
 *   - M/D/YYYY   (e.g. 12/31/2025)
 *
 * Returns { iso: string } on success, { error: string } on failure.
 */
function parseFollowUpInput(raw: string): { iso: string } | { error: string } {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return { error: 'Please enter a date.' };

  const now = new Date();

  if (trimmed === 'today') {
    now.setHours(9, 0, 0, 0);
    return { iso: now.toISOString() };
  }
  if (trimmed === 'tomorrow') {
    now.setDate(now.getDate() + 1);
    now.setHours(9, 0, 0, 0);
    return { iso: now.toISOString() };
  }
  if (trimmed === 'next week') {
    now.setDate(now.getDate() + 7);
    now.setHours(9, 0, 0, 0);
    return { iso: now.toISOString() };
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T09:00:00`);
    if (isNaN(d.getTime())) return { error: 'Invalid date. Use YYYY-MM-DD.' };
    if (d < new Date()) return { error: 'Follow-up date must be in the future.' };
    return { iso: d.toISOString() };
  }

  // M/D/YYYY or MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [m, day, y] = trimmed.split('/').map(Number);
    const d = new Date(y!, m! - 1, day!, 9, 0, 0);
    if (isNaN(d.getTime())) return { error: 'Invalid date. Use M/D/YYYY.' };
    if (d < new Date()) return { error: 'Follow-up date must be in the future.' };
    return { iso: d.toISOString() };
  }

  // ISO 8601 fallback
  const d = new Date(raw.trim());
  if (!isNaN(d.getTime())) {
    if (d < new Date()) return { error: 'Follow-up date must be in the future.' };
    return { iso: d.toISOString() };
  }

  return {
    error: 'Unrecognised format. Try "tomorrow", "2025-12-31", or "12/31/2025".',
  };
}

// ---------------------------------------------------------------------------
// Section header component
// ---------------------------------------------------------------------------

function SectionLabel({ label }: { label: string }) {
  return <Text style={sectionStyles.label}>{label}</Text>;
}

const sectionStyles = StyleSheet.create({
  label: {
    ...Typography.sectionLabel,
    color: LeadPulseColors.textMuted,
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads, updateLeadStatus, addNote, setFollowUp } = useLeads();

  const lead = leads.find((l) => l.id === id);

  const [noteText, setNoteText] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [followUpSuccess, setFollowUpSuccess] = useState(false);

  // ── Lead not found ──
  if (!lead) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Lead not found</Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backButtonText}>← Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Handlers ──

  function handleStatusChange(status: LeadStatus) {
    updateLeadStatus(lead!.id, status);
  }

  function handleAddNote() {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    addNote(lead!.id, trimmed);
    setNoteText('');
  }

  function handleSetFollowUp() {
    const trimmed = followUpInput.trim();
    if (!trimmed) {
      setFollowUpError('Please enter a date.');
      setFollowUpSuccess(false);
      return;
    }
    const result = parseFollowUpInput(trimmed);
    if ('error' in result) {
      setFollowUpError(result.error);
      setFollowUpSuccess(false);
      return;
    }
    setFollowUp(lead!.id, result.iso);
    setFollowUpInput('');
    setFollowUpError(null);
    setFollowUpSuccess(true);
    // Clear success message after 2 seconds
    setTimeout(() => setFollowUpSuccess(false), 2000);
  }

  function handleEmailPress() {
    Linking.openURL(`mailto:${lead!.email}`);
  }

  function handlePhonePress() {
    Linking.openURL(`tel:${lead!.phone}`);
  }

  // ── Render ──
  const sortedNotes = [...(lead.notes ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const sortedActivity = [...(lead.activityLog ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ── Back button row ── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          {/* ── Identity card ── */}
          <View style={styles.identityCard}>
            {/* Avatar circle */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {lead.name
                  .split(' ')
                  .map((p) => p[0] ?? '')
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>

            <Text style={styles.leadName}>{lead.name}</Text>

            {/* Source + status row */}
            <View style={styles.badgeRow}>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </Text>
              </View>
              <StatusPill status={lead.status} />
            </View>

            <Text style={styles.receivedAt}>
              Received {formatDateTime(lead.createdAt)}
            </Text>
          </View>

          {/* ── Quick actions ── */}
          <View style={styles.quickActions}>
            <Pressable
              onPress={handleEmailPress}
              accessibilityRole="button"
              accessibilityLabel={`Send email to ${lead.name}`}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <Text style={styles.actionBtnText}>✉ {lead.email || 'No email'}</Text>
            </Pressable>
            <Pressable
              onPress={handlePhonePress}
              accessibilityRole="button"
              accessibilityLabel={`Call ${lead.name}`}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <Text style={styles.actionBtnText}>📞 {lead.phone || 'No phone'}</Text>
            </Pressable>
          </View>

          {/* ── Status picker ── */}
          <SectionLabel label="STATUS" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusChips}>
            {ALL_STATUSES.map((s) => (
              <FilterChip
                key={s}
                label={s.charAt(0) + s.slice(1).toLowerCase()}
                active={lead.status === s}
                onPress={() => handleStatusChange(s)}
              />
            ))}
          </ScrollView>

          {/* ── Follow-up date ── */}
          <SectionLabel label="FOLLOW-UP DATE" />
          <Text style={styles.followUpCurrent}>
            {lead.followUpAt ? `📅 ${formatDateTime(lead.followUpAt)}` : 'Not set'}
          </Text>
          <Text style={styles.followUpHint}>
            {'Enter a date: "tomorrow", "next week", "2025-12-31", or "12/31/2025"'}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.textInput,
                followUpError ? styles.textInputError : null,
              ]}
              value={followUpInput}
              onChangeText={(t) => {
                setFollowUpInput(t);
                if (followUpError) setFollowUpError(null);
                if (followUpSuccess) setFollowUpSuccess(false);
              }}
              placeholder="e.g. tomorrow · 2025-12-31 · 12/31/2025"
              placeholderTextColor={LeadPulseColors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSetFollowUp}
              accessibilityLabel="Follow-up date input"
              accessibilityHint="Enter a date as tomorrow, next week, YYYY-MM-DD, or M/D/YYYY"
            />
            <Pressable
              onPress={handleSetFollowUp}
              accessibilityRole="button"
              accessibilityLabel="Set follow-up date"
              style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}>
              <Text style={styles.submitBtnText}>Set</Text>
            </Pressable>
          </View>
          {followUpError ? (
            <Text style={styles.inputErrorText}>{followUpError}</Text>
          ) : null}
          {followUpSuccess ? (
            <Text style={styles.inputSuccessText}>✓ Follow-up date saved</Text>
          ) : null}

          {/* ── Notes ── */}
          <SectionLabel label="NOTES" />
          {sortedNotes.length === 0 ? (
            <Text style={styles.emptyText}>No notes yet.</Text>
          ) : (
            sortedNotes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteText}>{note.text}</Text>
                <Text style={styles.noteTime}>{formatDateTime(note.createdAt)}</Text>
              </View>
            ))
          )}
          {/* Add note input */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note…"
              placeholderTextColor={LeadPulseColors.textMuted}
              multiline
              returnKeyType="default"
              accessibilityLabel="Add note"
            />
            <Pressable
              onPress={handleAddNote}
              accessibilityRole="button"
              accessibilityLabel="Save note"
              style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}>
              <Text style={styles.submitBtnText}>Add</Text>
            </Pressable>
          </View>

          {/* ── Activity timeline ── */}
          <SectionLabel label="ACTIVITY" />
          {sortedActivity.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet.</Text>
          ) : (
            sortedActivity.map((event) => (
              <View key={event.id} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityDesc}>{event.description}</Text>
                  <Text style={styles.activityTime}>{formatDateTime(event.createdAt)}</Text>
                </View>
              </View>
            ))
          )}

          {/* Bottom padding so last item isn't hidden behind keyboard */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  // Top bar
  topBar: {
    paddingHorizontal: Spacing.threeHalf,
    paddingVertical: Spacing.two,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  backBtnText: {
    ...Typography.metaLabel,
    color: LeadPulseColors.accentBlue,
  },
  pressed: {
    opacity: 0.7,
  },
  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.threeHalf,
    paddingBottom: Spacing.five,
  },
  // Identity card
  identityCard: {
    alignItems: 'center',
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.twoHalf,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: LeadPulseColors.surfaceAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  leadName: {
    ...Typography.screenTitle,
    color: LeadPulseColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sourceBadge: {
    backgroundColor: LeadPulseColors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
  },
  sourceText: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
  },
  receivedAt: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
    marginTop: Spacing.one,
  },
  // Quick actions
  quickActions: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  actionBtn: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.two,
  },
  actionBtnText: {
    ...Typography.metaValue,
    color: LeadPulseColors.accentBlue,
  },
  // Status chips
  statusChips: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  // Follow-up
  followUpCurrent: {
    ...Typography.body,
    color: LeadPulseColors.textSecondary,
    marginBottom: Spacing.one,
  },
  followUpHint: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
    marginBottom: Spacing.two,
  },
  // Input row
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-end',
    marginBottom: Spacing.two,
  },
  textInput: {
    flex: 1,
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.two,
    color: LeadPulseColors.textPrimary,
    ...Typography.body,
  },
  textInputError: {
    borderColor: LeadPulseColors.errorRed,
  },
  noteInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: LeadPulseColors.accentBlue,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-end',
  },
  submitBtnText: {
    color: '#ffffff',
    ...Typography.metaLabel,
  },
  // Notes
  noteCard: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    padding: Spacing.twoHalf,
    marginBottom: Spacing.two,
  },
  noteText: {
    ...Typography.body,
    color: LeadPulseColors.textSecondary,
    marginBottom: 4,
  },
  noteTime: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
    textAlign: 'right',
  },
  emptyText: {
    ...Typography.body,
    color: LeadPulseColors.textMuted,
    marginBottom: Spacing.two,
  },
  inputErrorText: {
    ...Typography.timestamp,
    color: LeadPulseColors.errorRed,
    marginBottom: Spacing.two,
    marginTop: -Spacing.one,
  },
  inputSuccessText: {
    ...Typography.timestamp,
    color: LeadPulseColors.connectedGreen,
    marginBottom: Spacing.two,
    marginTop: -Spacing.one,
  },
  // Activity timeline
  activityItem: {
    flexDirection: 'row',
    gap: Spacing.twoHalf,
    marginBottom: Spacing.twoHalf,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: LeadPulseColors.accentBlue,
    marginTop: 6,
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityDesc: {
    ...Typography.metaValue,
    color: LeadPulseColors.textSecondary,
  },
  activityTime: {
    ...Typography.timestamp,
    color: LeadPulseColors.textMuted,
    marginTop: 2,
  },
  // Not found state
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  notFoundTitle: {
    ...Typography.leadName,
    color: LeadPulseColors.textPrimary,
  },
  backButton: {
    backgroundColor: LeadPulseColors.accentBlue,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backButtonText: {
    color: '#ffffff',
    ...Typography.metaLabel,
  },
  bottomSpacer: {
    height: Spacing.five,
  },
});
