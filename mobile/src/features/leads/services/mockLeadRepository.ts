/**
 * MockLeadRepository — in-memory implementation of ILeadRepository.
 *
 * Initializes from sampleLeads on first import. All mutations use spread
 * to produce new object references (never mutate in place), so React's
 * state comparisons work correctly.
 *
 * LOCAL-ONLY: all changes reset when the app restarts. This will be
 * replaced by an API-backed repository in the backend integration phase.
 */
import { sampleLeads } from '../data/sampleLeads';
import type { ActivityEvent, Lead, LeadStatus, NoteEntry } from '../types';
import type { ILeadRepository } from './leadRepository';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class MockLeadRepository implements ILeadRepository {
  // Module-level array. Initialized once; updated by mutation methods below.
  private leads: Lead[] = sampleLeads.map((l) => ({ ...l }));

  getAll(): Lead[] {
    // Return a shallow copy of the array so callers cannot mutate the
    // internal reference, but each Lead object is not deep-cloned here —
    // callers must treat Lead objects as read-only.
    return [...this.leads];
  }

  getById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  updateStatus(id: string, status: LeadStatus): Lead | undefined {
    const index = this.leads.findIndex((l) => l.id === id);
    if (index === -1) return undefined;

    const event: ActivityEvent = {
      id: makeId(),
      type: 'status_change',
      description: `Status changed to ${status.charAt(0) + status.slice(1).toLowerCase()}.`,
      createdAt: new Date().toISOString(),
    };

    const updated: Lead = {
      ...this.leads[index]!,
      status,
      activityLog: [...(this.leads[index]!.activityLog ?? []), event],
    };

    this.leads = [
      ...this.leads.slice(0, index),
      updated,
      ...this.leads.slice(index + 1),
    ];

    return updated;
  }

  addNote(leadId: string, text: string): Lead | undefined {
    const index = this.leads.findIndex((l) => l.id === leadId);
    if (index === -1) return undefined;

    const now = new Date().toISOString();

    const note: NoteEntry = {
      id: makeId(),
      text,
      createdAt: now,
    };

    const event: ActivityEvent = {
      id: makeId(),
      type: 'note_added',
      description: 'Note added.',
      createdAt: now,
    };

    const updated: Lead = {
      ...this.leads[index]!,
      notes: [...(this.leads[index]!.notes ?? []), note],
      activityLog: [...(this.leads[index]!.activityLog ?? []), event],
    };

    this.leads = [
      ...this.leads.slice(0, index),
      updated,
      ...this.leads.slice(index + 1),
    ];

    return updated;
  }

  setFollowUp(leadId: string, date: string): Lead | undefined {
    const index = this.leads.findIndex((l) => l.id === leadId);
    if (index === -1) return undefined;

    const event: ActivityEvent = {
      id: makeId(),
      type: 'follow_up_set',
      description: `Follow-up set for ${date}.`,
      createdAt: new Date().toISOString(),
    };

    const updated: Lead = {
      ...this.leads[index]!,
      followUpAt: date,
      activityLog: [...(this.leads[index]!.activityLog ?? []), event],
    };

    this.leads = [
      ...this.leads.slice(0, index),
      updated,
      ...this.leads.slice(index + 1),
    ];

    return updated;
  }

  addLead(lead: Lead): void {
    const event: ActivityEvent = {
      id: makeId(),
      type: 'lead_created',
      description: 'Lead received.',
      createdAt: new Date().toISOString(),
    };

    const leadWithEvent: Lead = {
      ...lead,
      notes: lead.notes ?? [],
      activityLog: [...(lead.activityLog ?? []), event],
    };

    // Prepend; deduplicate by id in case the socket fires the same lead twice
    this.leads = [
      leadWithEvent,
      ...this.leads.filter((l) => l.id !== lead.id),
    ];
  }
}

// Singleton — one repository for the entire app session
export const mockLeadRepository = new MockLeadRepository();
