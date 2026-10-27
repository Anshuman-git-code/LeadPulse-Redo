const { prisma } = require('../db/prisma');

async function saveLead(lead) {
    return prisma.lead.upsert({
        where: {
            leadgen_id: String(lead.id),
        },
        update: {
            // createdAt is intentionally omitted: the original lead timestamp
            // must not be overwritten if the same leadgen_id is delivered again.
            name: lead.name || 'Unknown',
            email: lead.email || "",
            phone: lead.phone || "",
        },
        create: {
            leadgen_id: String(lead.id),
            name: lead.name || 'Unknown',
            email: lead.email || "",
            phone: lead.phone || "",
            // lead.createdAt is the ISO string set by normalizeLead() from the
            // raw Meta created_time field. If absent, the DB default (now()) applies.
            createdAt: lead.createdAt ? new Date(lead.createdAt) : undefined,
        },
    });
}

async function listLeads() {
    const rows = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' }
    });

    console.log('Rows:', rows);
    console.log('Is arrry:', Array.isArray(rows));

    return rows.map((row) => ({
        id: row.leadgen_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        createdAt: row.createdAt,
    }));

}

module.exports = { saveLead, listLeads }; 
