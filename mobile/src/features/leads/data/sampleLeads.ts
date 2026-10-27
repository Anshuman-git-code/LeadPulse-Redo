/**
 * Synthetic lead records for UI demonstration.
 *
 * All names, emails, phone numbers, and IDs are clearly fictional.
 * This data resets every time the app restarts — it is not persisted.
 * Used as initial state for MockLeadRepository and LeadsContext.
 */
import type { Lead } from '../types';

export const sampleLeads: Lead[] = [
  {
    id: 'demo-001',
    name: 'Alex Demo',
    email: 'alex.demo@example.com',
    phone: '+1 555-0101',
    source: 'META_LEAD_ADS',
    status: 'NEW',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min ago
    followUpAt: new Date(Date.now() + 2 * 24 * 3600_000).toISOString(), // 2 days from now
    notes: [
      {
        id: 'note-001-1',
        text: 'Called but went to voicemail. Will try again tomorrow.',
        createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-001-1',
        type: 'lead_created',
        description: 'Lead received from Meta Lead Ads.',
        createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-002',
    name: 'Jordan Sample',
    email: 'jordan.sample@example.com',
    phone: '+1 555-0102',
    source: 'META_LEAD_ADS',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), // 2 hours ago
    followUpAt: new Date(Date.now() + 3 * 24 * 3600_000).toISOString(), // 3 days from now
    notes: [
      {
        id: 'note-002-1',
        text: 'Spoke briefly. Interested in the premium plan. Scheduled callback.',
        createdAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-002-1',
        type: 'lead_created',
        description: 'Lead received from Meta Lead Ads.',
        createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      },
      {
        id: 'evt-002-2',
        type: 'status_change',
        description: 'Status changed to Contacted.',
        createdAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-003',
    name: 'Morgan Testuser',
    email: 'morgan.testuser@example.com',
    phone: '+1 555-0103',
    source: 'TEST',
    status: 'QUALIFIED',
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    notes: [
      {
        id: 'note-003-1',
        text: 'Confirmed budget and timeline. Ready to move forward.',
        createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-003-1',
        type: 'lead_created',
        description: 'Lead created via test endpoint.',
        createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
      },
      {
        id: 'evt-003-2',
        type: 'status_change',
        description: 'Status changed to Contacted.',
        createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
      },
      {
        id: 'evt-003-3',
        type: 'status_change',
        description: 'Status changed to Qualified.',
        createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-004',
    name: 'Riley Placeholder',
    email: 'riley.placeholder@example.com',
    phone: '+1 555-0104',
    source: 'META_LEAD_ADS',
    status: 'CONVERTED',
    createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(), // yesterday
    notes: [
      {
        id: 'note-004-1',
        text: 'Signed contract. Onboarding call scheduled for next week.',
        createdAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-004-1',
        type: 'lead_created',
        description: 'Lead received from Meta Lead Ads.',
        createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
      },
      {
        id: 'evt-004-2',
        type: 'status_change',
        description: 'Status changed to Contacted.',
        createdAt: new Date(Date.now() - 23 * 3600_000).toISOString(),
      },
      {
        id: 'evt-004-3',
        type: 'status_change',
        description: 'Status changed to Qualified.',
        createdAt: new Date(Date.now() - 22 * 3600_000).toISOString(),
      },
      {
        id: 'evt-004-4',
        type: 'status_change',
        description: 'Status changed to Converted.',
        createdAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-005',
    name: 'Casey Fakename',
    email: 'casey.fakename@example.com',
    phone: '+1 555-0105',
    source: 'META_LEAD_ADS',
    status: 'LOST',
    createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(), // 2 days ago
    notes: [
      {
        id: 'note-005-1',
        text: 'Went with a competitor. Left on good terms.',
        createdAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-005-1',
        type: 'lead_created',
        description: 'Lead received from Meta Lead Ads.',
        createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
      },
      {
        id: 'evt-005-2',
        type: 'status_change',
        description: 'Status changed to Contacted.',
        createdAt: new Date(Date.now() - 40 * 3600_000).toISOString(),
      },
      {
        id: 'evt-005-3',
        type: 'status_change',
        description: 'Status changed to Lost.',
        createdAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-006',
    name: 'Drew Example',
    email: 'drew.example@example.com',
    phone: '+1 555-0106',
    source: 'TEST',
    status: 'NEW',
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(), // 10 min ago
    notes: [
      {
        id: 'note-006-1',
        text: 'New inbound via test form. High priority.',
        createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-006-1',
        type: 'lead_created',
        description: 'Lead created via test endpoint.',
        createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-007',
    name: 'Sam Synthetic',
    email: 'sam.synthetic@example.com',
    phone: '+1 555-0107',
    source: 'META_LEAD_ADS',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(), // 3 days ago
    notes: [
      {
        id: 'note-007-1',
        text: 'Left voicemail. Follow-up email sent.',
        createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-007-1',
        type: 'lead_created',
        description: 'Lead received from Meta Lead Ads.',
        createdAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
      },
      {
        id: 'evt-007-2',
        type: 'status_change',
        description: 'Status changed to Contacted.',
        createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-008',
    name: 'Taylor Mock',
    email: 'taylor.mock@example.com',
    phone: '+1 555-0108',
    source: 'META_LEAD_ADS',
    status: 'QUALIFIED',
    createdAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(), // 5 days ago
    notes: [
      {
        id: 'note-008-1',
        text: 'Detailed discovery call completed. Strong fit.',
        createdAt: new Date(Date.now() - 4 * 24 * 3600_000).toISOString(),
      },
    ],
    activityLog: [
      {
        id: 'evt-008-1',
        type: 'lead_created',
        description: 'Lead received from Meta Lead Ads.',
        createdAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
      },
      {
        id: 'evt-008-2',
        type: 'status_change',
        description: 'Status changed to Contacted.',
        createdAt: new Date(Date.now() - 4 * 24 * 3600_000 + 3600_000).toISOString(),
      },
      {
        id: 'evt-008-3',
        type: 'status_change',
        description: 'Status changed to Qualified.',
        createdAt: new Date(Date.now() - 4 * 24 * 3600_000).toISOString(),
      },
    ],
  },
];
