/**
 * LeadsContext — single source of truth for all lead state in the app.
 *
 * LeadsProvider:
 *   - Initializes from mockLeadRepository (synthetic data available immediately)
 *   - Manages the Socket.IO lifecycle (connect, disconnect, event listeners)
 *   - Exposes mutations that update the in-memory repository and re-render subscribers
 *
 * useLeads():
 *   - Custom hook for consuming the context. Throws if used outside LeadsProvider.
 *
 * LOCAL-ONLY: status changes, notes, and follow-ups reset on app restart.
 * The repository will be swapped for an API implementation in the backend phase.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

import { socket } from '@/services/socket';

import type { Lead, LeadStatus } from './types';
import { mockLeadRepository } from './services/mockLeadRepository';
import { apiLeadRepository } from './services/apiLeadRepository';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface LeadsContextValue {
  /** All leads, newest first */
  leads: Lead[];
  /** True while the initial fetch from GET /leads is in progress */
  isLoading: boolean;
  /** True if the initial fetch failed and mock data is being shown */
  fetchError: boolean;
  /** Human-readable Socket.IO connection status for the status indicator */
  connectionStatus: string;
  /** Whether leads are from mock data or a live socket connection */
  dataMode: 'mock' | 'socket';
  /** Update a lead's status. Calls repository then syncs React state. */
  updateLeadStatus(id: string, status: LeadStatus): void;
  /** Add a note to a lead. Local-only in this phase. */
  addNote(leadId: string, text: string): void;
  /** Set the follow-up date for a lead. Local-only in this phase. */
  setFollowUp(leadId: string, date: string): void;
  /** Prepend a new lead (used by the Socket.IO handler). */
  addLead(lead: Lead): void;
}

export const LeadsContext = createContext<LeadsContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function LeadsProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  // Start empty — leads will be populated by the initial fetch or mock fallback.
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting…');
  const [dataMode, setDataMode] = useState<'mock' | 'socket'>('mock');

  // Sync React state from mock repository after local mutations
  function syncMockState() {
    setLeads(mockLeadRepository.getAll());
  }

  // Initial leads fetch + Socket.IO lifecycle
  useEffect(() => {
    let mounted = true;

    // ── 1. Fetch saved leads from the backend on mount ──
    async function fetchInitialLeads() {
      try {
        const apiLeads = await apiLeadRepository.fetchAll();
        if (mounted) {
          setLeads(apiLeads);
          setFetchError(false);
          setIsLoading(false);
        }
      } catch {
        // Backend unreachable or returned an error — fall back to mock data
        // so the app remains demoable offline.
        if (mounted) {
          setLeads(mockLeadRepository.getAll());
          setFetchError(true);
          setIsLoading(false);
        }
      }
    }
    fetchInitialLeads();

    // ── 2. Socket.IO lifecycle (unchanged from original) ──
    function onConnect() {
      setConnectionStatus('Connected to backend');
      setDataMode('socket');
    }

    function onDisconnect() {
      setConnectionStatus('Disconnected — reconnecting…');
    }

    function onConnectError(error: Error) {
      setConnectionStatus(`Connection error: ${error.message}`);
    }

    // Incoming leads from the backend are normalized before being stored
    function onNewLead(incoming: Partial<Lead> & { id: string }) {
      const lead: Lead = {
        id: incoming.id,
        name: incoming.name ?? 'Unknown',
        email: incoming.email ?? '',
        phone: incoming.phone ?? '',
        source: incoming.source ?? 'META_LEAD_ADS',
        status: incoming.status ?? 'NEW',
        createdAt: incoming.createdAt ?? new Date().toISOString(),
        followUpAt: incoming.followUpAt,
        notes: incoming.notes ?? [],
        activityLog: incoming.activityLog ?? [],
      };
      // Prepend to the current leads array (whether from API or mock)
      setLeads((prev) => [lead, ...prev.filter((l) => l.id !== lead.id)]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-lead', onNewLead);
    socket.connect();

    return () => {
      // Prevent state updates after unmount (R-010 mounted-flag pattern)
      mounted = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-lead', onNewLead);
      socket.disconnect();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Mutation helpers
  // updateLeadStatus: optimistic update + PATCH /leads/:id + rollback on failure
  // addNote, setFollowUp: still local-only (mock repository)
  // addLead: still local-only (socket handler uses setLeads directly)
  // ---------------------------------------------------------------------------

  function updateLeadStatus(id: string, status: LeadStatus) {
    // If the backend was unreachable at startup, use the mock repository
    // so the app remains demoable offline.
    if (fetchError) {
      mockLeadRepository.updateStatus(id, status);
      syncMockState();
      return;
    }

    // 1. Save original status for potential rollback
    const originalLead = leads.find((l) => l.id === id);
    if (!originalLead) return;
    const previousStatus = originalLead.status;

    // 2. Optimistically update local state immediately — the UI shows
    //    the new status chip without waiting for the network round-trip.
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );

    // 3. Fire PATCH /leads/:id in the background. The function returns
    //    synchronously; the promise resolves/rejects later.
    apiLeadRepository
      .fetchUpdateStatus(id, status)
      .then((updatedLead) => {
        // Confirm with the API response — replaces the local lead with the
        // server's version in case the server changed anything else.
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? updatedLead : l))
        );
      })
      .catch(() => {
        // Roll back to the original status. The chip visibly reverts,
        // which is the user's feedback that the change did not persist.
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: previousStatus } : l))
        );
      });
  }

  function addNote(leadId: string, text: string) {
    mockLeadRepository.addNote(leadId, text);
    syncMockState();
  }

  function setFollowUp(leadId: string, date: string) {
    mockLeadRepository.setFollowUp(leadId, date);
    syncMockState();
  }

  function addLead(lead: Lead) {
    mockLeadRepository.addLead(lead);
    syncMockState();
  }

  return (
    <LeadsContext.Provider
      value={{
        leads,
        isLoading,
        fetchError,
        connectionStatus,
        dataMode,
        updateLeadStatus,
        addNote,
        setFollowUp,
        addLead,
      }}>
      {children}
    </LeadsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) {
    throw new Error('useLeads must be used inside a <LeadsProvider>.');
  }
  return ctx;
}
