/**
 * ApiLeadRepository — real backend implementation of ILeadRepository.
 *
 * Uses fetch() to call the LeadPulse backend API. Designed to be swappable
 * with MockLeadRepository (which uses in-memory sample data) — both
 * implement the same ILeadRepository interface.
 *
 * DB-3-A: Only getAll() is implemented (initial leads fetch on app open).
 * DB-3-B will implement updateStatus() (PATCH /leads/:id).
 * Other methods (getById, addNote, setFollowUp, addLead) are stubbed and
 * will be implemented as the corresponding backend endpoints are added.
 *
 * NOTE on async vs sync: ILeadRepository defines synchronous signatures
 * (returning Lead[] directly). HTTP calls are inherently async. The context
 * handles this by awaiting getAll() inside its useEffect and updating state
 * only when the promise resolves. The other stubbed methods throw to make
 * it clear they are not yet wired to the backend.
 */
import type { Lead, LeadStatus } from '../types';
import type { ILeadRepository } from './leadRepository';

/**
 * Base URL of the LeadPulse backend API.
 * Reuses EXPO_PUBLIC_SOCKET_URL since the API and Socket.IO server share
 * the same host and port. Falls back to localhost for development.
 */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://127.0.0.1:3000';

export class ApiLeadRepository implements ILeadRepository {
  /**
   * Fetch all leads from GET /leads (first page, up to 100).
   * Returns the array of leads on success.
   * Throws on network error or non-2xx HTTP response.
   */
  getAll(): Lead[] {
    // Synchronous signature required by ILeadRepository, but fetch is async.
    // This method is not used directly — the context calls fetchAll() below
    // which is async. We keep this for interface compliance.
    throw new Error('ApiLeadRepository.getAll() is async — use fetchAll()');
  }

  /**
   * Async version of getAll() — the one actually called by LeadsContext.
   * Returns a Promise<Lead[]> so the context can await it in useEffect.
   */
  async fetchAll(): Promise<Lead[]> {
    const url = `${API_BASE_URL}/leads?limit=100`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GET /leads failed: HTTP ${response.status}`);
    }

    const json = await response.json();
    return json.data as Lead[];
  }

  /**
   * Update a lead's status via PATCH /leads/:id.
   * Wired to the backend in DB-3-B. The context calls fetchUpdateStatus()
   * (the async version below) with an optimistic update pattern.
   */
  updateStatus(_id: string, _status: LeadStatus): Lead | undefined {
    throw new Error('ApiLeadRepository.updateStatus() is async — use fetchUpdateStatus()');
  }

  /**
   * Async version of updateStatus() — calls PATCH /leads/:id.
   * Used by LeadsContext.updateLeadStatus() with optimistic update + rollback.
   * Returns the updated Lead on success; throws on network or HTTP error.
   */
  async fetchUpdateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const url = `${API_BASE_URL}/leads/${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        `PATCH /leads/${id} failed: HTTP ${response.status} — ${body.error ?? 'unknown error'}`
      );
    }

    const json = await response.json();
    return json.data as Lead;
  }

  // ── Stubbed methods (not yet wired to backend) ────────────────────────

  getById(_id: string): Lead | undefined {
    throw new Error('ApiLeadRepository.getById() not implemented yet');
  }

  addNote(_leadId: string, _text: string): Lead | undefined {
    throw new Error('ApiLeadRepository.addNote() not implemented yet');
  }

  setFollowUp(_leadId: string, _date: string): Lead | undefined {
    throw new Error('ApiLeadRepository.setFollowUp() not implemented yet');
  }

  addLead(_lead: Lead): void {
    // Socket.IO new-lead events are handled directly in LeadsContext,
    // not via the repository. This method exists for interface compliance.
    throw new Error('ApiLeadRepository.addLead() — socket events are handled in context');
  }
}

// Singleton instance — one repository for the entire app session.
export const apiLeadRepository = new ApiLeadRepository();
