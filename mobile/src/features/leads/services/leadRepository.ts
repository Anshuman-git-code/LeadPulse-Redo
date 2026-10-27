/**
 * ILeadRepository — interface that every lead data source must implement.
 *
 * The mock implementation (mockLeadRepository.ts) uses this interface.
 * When the API integration phase begins, a real implementation backed by
 * the LeadPulse backend can be swapped in without touching the screens.
 */
import type { Lead, LeadStatus } from '../types';

export interface ILeadRepository {
  /** Return all leads (newest first). */
  getAll(): Lead[];

  /** Return a single lead by id, or undefined if not found. */
  getById(id: string): Lead | undefined;

  /**
   * Update the status of a lead. Appends a status_change ActivityEvent.
   * Returns the updated lead, or undefined if the id was not found.
   */
  updateStatus(id: string, status: LeadStatus): Lead | undefined;

  /**
   * Add a text note to a lead. Appends a note_added ActivityEvent.
   * Returns the updated lead, or undefined if the id was not found.
   */
  addNote(leadId: string, text: string): Lead | undefined;

  /**
   * Set or update the follow-up date/time for a lead.
   * Appends a follow_up_set ActivityEvent.
   * Returns the updated lead, or undefined if the id was not found.
   */
  setFollowUp(leadId: string, date: string): Lead | undefined;

  /**
   * Prepend a new lead to the list.
   * Appends a lead_created ActivityEvent to the lead before storing it.
   */
  addLead(lead: Lead): void;
}
