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

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface LeadsContextValue {
  /** All leads, newest first */
  leads: Lead[];
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
  const [leads, setLeads] = useState<Lead[]>(() => mockLeadRepository.getAll());
  const [connectionStatus, setConnectionStatus] = useState('Connecting…');
  const [dataMode, setDataMode] = useState<'mock' | 'socket'>('mock');

  // Sync React state from repository after every mutation
  function syncState() {
    setLeads(mockLeadRepository.getAll());
  }

  // Socket.IO lifecycle — mirrors the original index.tsx pattern
  useEffect(() => {
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
      mockLeadRepository.addLead(lead);
      syncState();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-lead', onNewLead);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-lead', onNewLead);
      socket.disconnect();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Mutation helpers — call repo, then sync state
  // ---------------------------------------------------------------------------

  function updateLeadStatus(id: string, status: LeadStatus) {
    mockLeadRepository.updateStatus(id, status);
    syncState();
  }

  function addNote(leadId: string, text: string) {
    mockLeadRepository.addNote(leadId, text);
    syncState();
  }

  function setFollowUp(leadId: string, date: string) {
    mockLeadRepository.setFollowUp(leadId, date);
    syncState();
  }

  function addLead(lead: Lead) {
    mockLeadRepository.addLead(lead);
    syncState();
  }

  return (
    <LeadsContext.Provider
      value={{ leads, connectionStatus, dataMode, updateLeadStatus, addNote, setFollowUp, addLead }}>
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
