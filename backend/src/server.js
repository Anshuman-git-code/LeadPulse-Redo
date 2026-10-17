require('dotenv').config();
const { prisma } = require('./db/prisma');
const { listLeads, saveLead } = require('./leads/repository');

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const webhookRouter = require('./webhook');
const { initializeRealtime, publishLead } = require('./realtime');

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
        const leads = await listLeads({
            limit: req.query.limit,
            cursor: req.query.cursor,
        });
        res.json({ data: leads });
    } catch (error) {
        console.error('Failed to list leads:', error.message);
        res.status(500).json({ error: 'Failed to retrieve leads' });
    }
});

// Parse ordinary JSON bodies for non-webhook routes, including /test/lead.
app.use(express.json({ limit: '1mb' }));

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
        const { name, email, phone } = req.body || {};
        const lead = {
            id: `test-${Date.now()}`,
            name: name || 'Unknown',
            email: email || '',
            phone: phone || '',
            createdAt: new Date().toISOString(),
        };

        try {
            const saved = await saveLead(lead);
            publishLead({
                id: saved.leadgenId,
                name: saved.name,
                email: saved.email,
                phone: saved.phone,
                createdAt: saved.createdAt.toISOString(),
            });
            res.status(201).json({ success: true, lead: saved });
        } catch (error) {
            console.error('Failed to save test lead:', error.message);
            res.status(500).json({ error: 'Failed to save lead' });
        }
    });
}

const PORT = Number(process.env.PORT || 3000);

httpServer.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});