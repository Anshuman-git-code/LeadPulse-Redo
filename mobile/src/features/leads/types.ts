/**
 * LeadPulse domain types — single source of truth for all lead-related shapes.
 *
 * These types are imported by screens, components, the mock repository, and
 * LeadsContext. leadpulse-theme.ts re-exports LeadStatus and LeadSource from
 * here so existing imports from the constants file continue to work.
 */

/**
 * The five lifecycle stages a lead can be in.
 * These match the backend LeadStatus enum exactly.
 * Internal values are uppercase strings — do not change them.
 */
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

/**
 * Where the lead originated.
 * META_LEAD_ADS = came through the real Meta webhook.
 * TEST          = created via the /test/lead development endpoint.
 */
export type LeadSource = 'META_LEAD_ADS' | 'TEST';

/**
 * A timestamped note attached to a lead.
 * Notes are local-only in this phase; they do not persist to the database.
 */
export interface NoteEntry {
  id: string;
  text: string;
  createdAt: string; // ISO 8601 string
}

/**
 * A log entry describing an event in this lead's lifecycle.
 * Used by the activity timeline in the Detail screen.
 */
export interface ActivityEvent {
  id: string;
  type: 'status_change' | 'note_added' | 'follow_up_set' | 'lead_created';
  description: string;
  createdAt: string; // ISO 8601 string
}

/**
 * A single lead record as it exists in the local app state.
 *
 * The fields id, name, email, phone, source, status, and createdAt are always
 * present. followUpAt, notes, and activityLog are optional but initialized to
 * empty arrays by the mock repository.
 *
 * LOCAL-ONLY FIELDS (this phase):
 * - followUpAt: scheduled follow-up date. Resets on app restart.
 * - notes:      user-added notes. Reset on app restart.
 * - activityLog: event history. Resets on app restart.
 *
 * These will be persisted to the backend in the API integration phase.
 */
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  /** ISO 8601 string — when this lead was received */
  createdAt: string;
  /** ISO 8601 string — optional scheduled follow-up date/time */
  followUpAt?: string;
  /** Notes added by the user */
  notes: NoteEntry[];
  /** Chronological log of status changes and actions */
  activityLog: ActivityEvent[];
}
