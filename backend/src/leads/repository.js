const { prisma } = require('../db/prisma');

async function saveLead(lead) {
    return prisma.lead.upsert({
        where: {
            leadgen_id: String(lead.id),
        },
        update: {
            name: lead.name || 'Unknown',
            email: lead.email || "",
            phone: lead.phone || "",
            createdAt: lead.created_time ? new Date(lead.createdAt) : undefined,
        },
        create: {
            leadgen_id: String(lead.id),
            name: lead.name || 'Unknown',
            email: lead.email || "",
            phone: lead.phone || "",
            createdAt: lead.created_time ? new Date(lead.createdAt) : undefined,
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