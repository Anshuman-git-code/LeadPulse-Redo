require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const webhookRouter = require('./webhook');
const { initializeRealtime, publishLead } = require('./realtime');

const { prisma } = require('./db/prisma');
const { listLeads, saveLead, updateLeadStatus } = require('./leads/repository');

const app = express();

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'ok' });
    } catch (error) {
        console.error('Health check failed:', error.message);
        res.status(503).json({ status: 'error', database: 'unavailable' });
    }
});

// Preserve the original request bytes for HMAC validation.
app.use(
    '/webhook/meta',
    express.raw({ type: 'application/json', limit: '1mb' }),
    webhookRouter
);

app.get('/leads', async (req, res) => {
    try {
        // Parse and clamp pagination params.
        // limit: default 50, minimum 1, maximum 100.
        // offset: default 0, minimum 0.
        const rawLimit = parseInt(req.query.limit, 10);
        const rawOffset = parseInt(req.query.offset, 10);
        const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
        const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

        const { leads, total } = await listLeads({ limit, offset });
        return res.json({ data: leads, total });
    } catch (error) {
        console.error('Failed to retrieve leads:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Parse ordinary JSON bodies for non-webhook routes, including /test/lead.
app.use(express.json({ limit: '1mb' }));

// Valid lead status values — must match the LeadStatus enum in schema.prisma
// and mobile/src/features/leads/types.ts LeadStatus exactly.
const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

app.patch('/leads/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status before any database call.
    if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
        });
    }

    try {
        const lead = await updateLeadStatus(id, status);
        return res.json({ data: lead });
    } catch (error) {
        // Prisma P2025: record to update not found → 404.
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Lead not found' });
        }
        console.error('Failed to update lead status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

initializeRealtime(io);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason);
    });
});

// Local development route for testing the realtime UI without Meta.
if (process.env.NODE_ENV !== 'production') {
    app.post('/test/lead', async (req, res) => {
        try {
            const { name, email, phone } = req.body;

            const lead = {
                id: `test-${Date.now()}`,
                name: name?.trim() || 'Unknown',
                email: email?.trim() || '',
                phone: phone?.trim() || '',
                source: 'TEST',
                status: 'NEW',
                createdAt: new Date().toISOString(),
            };

            const saved = await saveLead(lead);
            const publicLead = {
                id: saved.leadgen_id,
                name: saved.name,
                email: saved.email,
                phone: saved.phone,
                createdAt: saved.createdAt,
                status: saved.status,
                source: saved.source,
            };
            publishLead(publicLead);

            return res.status(201).json({ success: true, publicLead });
        } catch (error) {
            console.error('Failed to save the lead:', error.message);
            return res.status(500).json({ error: 'Failed to save lead' });
        }
    });
}

const PORT = Number(process.env.PORT || 3000);

httpServer.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});