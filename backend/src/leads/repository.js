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
            // source is set by the caller: 'TEST' for the dev endpoint,
            // 'META_LEAD_ADS' for real webhook leads. DB default is META_LEAD_ADS.
            source: lead.source || 'META_LEAD_ADS',
            // status always starts as NEW for new leads. DB default also covers this.
            status: lead.status || 'NEW',
        },
    });
}

async function listLeads({ limit = 50, offset = 0 } = {}) {
    // Run count and page fetch in parallel for efficiency.
    const [rows, total] = await Promise.all([
        prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.lead.count(),
    ]);

    return {
        total,
        leads: rows.map((row) => ({
            id: row.leadgen_id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            // Explicit ISO string: Prisma returns DateTime as a Date object.
            // .toISOString() ensures a consistent UTC string regardless of
            // how res.json() serialises it in different Node versions.
            createdAt: row.createdAt.toISOString(),
            status: row.status,
            source: row.source,
        })),
    };
}

/**
 * Update a lead's status by its public leadgen_id.
 *
 * Returns the updated public lead shape on success.
 * Throws a PrismaClientKnownRequestError with code P2025 if the
 * leadgen_id is not found — the caller should map this to HTTP 404.
 *
 * Note: Only status is updated here. Other fields (name, email, phone)
 * are not changed via this function — they come from the original lead
 * submission and should not be overwritten by a status update.
 */
async function updateLeadStatus(leadgenId, status) {
    const row = await prisma.lead.update({
        where: { leadgen_id: String(leadgenId) },
        data: { status },
    });

    return {
        id: row.leadgen_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        createdAt: row.createdAt.toISOString(),
        status: row.status,
        source: row.source,
    };
}

module.exports = { saveLead, listLeads, updateLeadStatus }; 
