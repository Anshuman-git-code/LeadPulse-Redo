const { prisma } = require('../db/prisma');

async function saveLead(lead) {
    return prisma.lead.upsert({
        where: { leadgenId: String(lead.id) },
        update: {
            name: lead.name || 'Unknown',
            email: lead.email || '',
            phone: lead.phone || '',
            createdAt: lead.createdAt ? new Date(lead.createdAt) : undefined,
        },
        create: {
            leadgenId: String(lead.id),
            name: lead.name || 'Unknown',
            email: lead.email || '',
            phone: lead.phone || '',
            createdAt: lead.createdAt ? new Date(lead.createdAt) : undefined,
        },
    });
}

async function listLeads({ limit = 50, cursor } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    return prisma.lead.findMany({
        take: safeLimit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
}

module.exports = { saveLead, listLeads };