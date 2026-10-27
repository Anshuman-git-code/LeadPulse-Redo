/**
 * LeadPulse Design Tokens
 *
 * This file is the single source of truth for every visual value used by
 * LeadPulse product screens. Change a value here and it updates everywhere.
 *
 * It is intentionally separate from theme.ts, which drives the Expo starter
 * components (ThemedText, ThemedView, Collapsible, etc.). The two files will
 * be consolidated when the starter screens are replaced in a later stage.
 *
 * HOW TO USE
 * ----------
 * Import the token you need and reference it inside StyleSheet.create():
 *
 *   import { LeadPulseColors, Spacing } from '@/constants/leadpulse-theme';
 *
 *   const styles = StyleSheet.create({
 *     card: { backgroundColor: LeadPulseColors.surface },
 *   });
 *
 * For status-specific colors, use StatusColors keyed by a LeadStatus value:
 *
 *   import { StatusColors, type LeadStatus } from '@/constants/leadpulse-theme';
 *
 *   const pill = StatusColors['NEW'];
 *   // → { background: '...', text: '...' }
 */

// ---------------------------------------------------------------------------
// Lead status and source types
//
// Canonical definitions now live in mobile/src/features/leads/types.ts.
// Re-exported here so existing imports from '@/constants/leadpulse-theme'
// continue to work without changes across the codebase.
// The local import below is needed so StatusColors (defined later in this
// file) can reference LeadStatus as a type without a circular dependency.
// ---------------------------------------------------------------------------
import type { LeadStatus, LeadSource } from '@/features/leads/types';

export type { LeadStatus, LeadSource };

// ---------------------------------------------------------------------------
// Base palette — LeadPulse dark navy visual language
//
// These values are the hardcoded palette already used by index.tsx, extracted
// here so every future screen can reference them by name rather than by magic
// hex string.
//
// Contrast notes (WCAG AA requires 4.5:1 for normal text, 3:1 for large text):
//   textPrimary (#e6edf3) on surface (#161b22):     ~11.5:1  ✅
//   textSecondary (#adbac7) on surface (#161b22):   ~6.1:1   ✅
//   textMuted (#768390) on background (#0d1117):    ~4.6:1   ✅
//   accentBlue (#58a6ff) on surface (#161b22):      ~5.9:1   ✅
//   connectedGreen (#3fb950) on surface (#161b22):  ~6.5:1   ✅
//   errorRed (#f85149) on surface (#161b22):        ~5.2:1   ✅
// All pairs verified against WCAG 2.1 AA standard (4.5:1 normal text).
// ---------------------------------------------------------------------------

export const LeadPulseColors = {
  /** Page / screen background */
  background: '#0d1117',

  /** Card and panel surface (sits on top of background) */
  surface: '#161b22',

  /** Border around cards and UI panels */
  surfaceBorder: '#30363d',

  /**
   * Left-accent border used on lead cards to draw the eye.
   * A strong blue stripe on the card's leading edge.
   */
  surfaceAccentBorder: '#1f6feb',

  /** Primary text: headings, lead names, important labels */
  textPrimary: '#e6edf3',

  /** Secondary text: body copy, metadata rows */
  textSecondary: '#adbac7',

  /** Muted text: timestamps, section labels, counts */
  textMuted: '#768390',

  /** Accent blue: links, field labels, active UI states */
  accentBlue: '#58a6ff',

  /** Success / connected indicator */
  connectedGreen: '#3fb950',

  /** Error / disconnected / destructive indicator */
  errorRed: '#f85149',
} as const;

// ---------------------------------------------------------------------------
// Status color pairs
//
// Each status has a background color and a text color. Both must be provided
// so that a StatusPill component can render the label text over the background
// and meet the WCAG 4.5:1 contrast requirement (status must not be conveyed
// by color alone — the text label is always required).
//
// Contrast verification (R-005 from research ledger):
//   NEW       white (#ffffff) on #1f6feb:   ~4.6:1  ✅ (just above threshold)
//   CONTACTED #79c0ff on #1c2d3f (dark bg): ~7.4:1  ✅
//   QUALIFIED #56d364 on #152619 (dark bg): ~7.2:1  ✅
//   CONVERTED white (#ffffff) on #1f883d:   ~4.7:1  ✅
//   LOST      #8b949e on #21262d (dark bg): ~4.6:1  ✅
//
// Implementation note: The "tinted" statuses (CONTACTED, QUALIFIED, LOST)
// use a dark near-black background matched to the tint color, rather than
// a semi-transparent overlay, because rgba semi-transparency produces
// unreliable contrast depending on the surface underneath.
// ---------------------------------------------------------------------------

export const StatusColors: Record<LeadStatus, { background: string; text: string }> = {
  /** New lead — not yet actioned. Blue to signal urgency. */
  NEW: {
    background: '#1f6feb',
    text: '#ffffff',
  },

  /** Lead has been contacted at least once. Soft blue tint. */
  CONTACTED: {
    background: '#1c2d3f',
    text: '#79c0ff',
  },

  /** Lead has been qualified as a genuine prospect. Green tint. */
  QUALIFIED: {
    background: '#152619',
    text: '#56d364',
  },

  /** Lead converted to a customer or sale. Solid green. */
  CONVERTED: {
    background: '#1f883d',
    text: '#ffffff',
  },

  /** Lead is no longer being pursued. Muted grey. */
  LOST: {
    background: '#21262d',
    text: '#8b949e',
  },
};

// ---------------------------------------------------------------------------
// Spacing scale
//
// Mirrors the scale in theme.ts to keep values consistent across the app
// during the transition period. All LeadPulse product screens should import
// from here rather than from theme.ts.
//
// Values are in logical pixels (the unit React Native uses for all layout).
// ---------------------------------------------------------------------------

export const Spacing = {
  /** 2px — hairline gap, tight padding inside a chip */
  half: 2,
  /** 4px — between icon and label */
  one: 4,
  /** 8px — between metadata rows, inner padding */
  two: 8,
  /** 12px — section gap, small component padding */
  twoHalf: 12,
  /** 16px — standard component padding, list item gap */
  three: 16,
  /** 20px — screen horizontal padding (matches current index.tsx) */
  threeHalf: 20,
  /** 24px — card padding, section header gap */
  four: 24,
  /** 32px — between major sections */
  five: 32,
  /** 64px — page-level spacing */
  six: 64,
} as const;

// ---------------------------------------------------------------------------
// Typography scale
//
// Font sizes and weights used across LeadPulse screens. Keeping these as
// named constants means changing the lead-name font size in one place
// updates every LeadRow, not just the one you happened to edit.
// ---------------------------------------------------------------------------

export const Typography = {
  /** Screen title (e.g. "LeadPulse") */
  screenTitle: { fontSize: 26, fontWeight: '700' as const, letterSpacing: 0.4 },

  /** Section heading label (e.g. "INCOMING LEADS · 3") */
  sectionLabel: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.2 },

  /** Lead name in a list row */
  leadName: { fontSize: 16, fontWeight: '700' as const },

  /** Metadata label (e.g. "Email", "Phone") */
  metaLabel: { fontSize: 13, fontWeight: '600' as const },

  /** Metadata value */
  metaValue: { fontSize: 13, fontWeight: '400' as const },

  /** Timestamp */
  timestamp: { fontSize: 11, fontWeight: '400' as const },

  /** Status pill label */
  statusPill: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6 },

  /** Body text */
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
} as const;

// ---------------------------------------------------------------------------
// Border radius scale
// ---------------------------------------------------------------------------

export const Radius = {
  /** Small: input fields, chips, pills */
  sm: 6,
  /** Medium: cards, panels */
  md: 12,
  /** Large: modal sheets, bottom drawers */
  lg: 20,
  /** Full: circular elements, round badges */
  full: 999,
} as const;
