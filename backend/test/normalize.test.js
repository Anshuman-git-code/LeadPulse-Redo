const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLead, findField } = require('../src/leads');

test('normalizes a lead with name, email, phone, and timestamp', () => {
    const lead = normalizeLead({
        id: '123',
        created_time: '2026-10-08T10:00:00+0000',
        field_data: [
            { name: 'full_name', values: ['Rahul'] },
            { name: 'email', values: ['r@test.com'] },
            { name: 'phone_number', values: ['9876543210'] },
        ],
    });

    assert.deepEqual(lead, {
        id: '123',
        name: 'Rahul',
        email: 'r@test.com',
        phone: '9876543210',
        createdAt: '2026-10-08T10:00:00+0000',
    });
});

test('uses safe defaults when optional fields are absent', () => {
    const lead = normalizeLead({
        id: '456',
        created_time: '2026-10-08T10:00:00+0000',
        field_data: [{ name: 'full_name', values: ['Priya'] }],
    });

    assert.equal(lead.id, '456');
    assert.equal(lead.name, 'Priya');
    assert.equal(lead.email, '');
    assert.equal(lead.phone, '');
});

test('rejects null input', () => {
    assert.throws(
        () => normalizeLead(null),
        /input must be a non-null object/
    );
});

test('rejects an object without an id', () => {
    assert.throws(
        () => normalizeLead({ field_data: [] }),
        /lead is missing an id/
    );
});

test('findField returns an empty string for a missing field', () => {
    assert.equal(findField([], 'email'), '');
});

test('survives when field_data is completely omitted', () => {
    const lead = normalizeLead({
        id: '999',
        created_time: '2026-10-08T10:00:00+0000'
    });

    assert.deepEqual(lead, {
        id: '999',
        name: 'Unknown',
        email: '',
        phone: '',
        createdAt: '2026-10-08T10:00:00+0000',
    });
});

test('survives when field_data sent, but forgets to send values', () => {
    const lead = normalizeLead({
        id: '123',
        created_time: '2026-10-08T10:00:00+0000',
        field_data: [
            { name: 'full_name' },
            { name: 'email' },
            { name: 'phone_number' },
        ],
    });

    assert.deepEqual(lead, {
        id: '123',
        name: 'Unknown',
        email: '',
        phone: '',
        createdAt: '2026-10-08T10:00:00+0000',
    });
});


test('survives when values sent, but its an empty array', () => {
    const lead = normalizeLead({
        id: '123',
        created_time: '2026-10-08T10:00:00+0000',
        field_data: [
            { name: 'full_name', values: [] },
            { name: 'email', values: [] },
            { name: 'phone_number', values: [] },
        ],
    });

    assert.deepEqual(lead, {
        id: '123',
        name: 'Unknown',
        email: '',
        phone: '',
        createdAt: '2026-10-08T10:00:00+0000',
    });
});