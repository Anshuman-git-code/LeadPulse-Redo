require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const webhookRouter = require('./webhook');
const { initializeRealtime, publishLead } = require('./realtime');

const { prisma } = require('./db/prisma');
const { listLeads, saveLead } = require('./leads/repository');

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
        const leads = await listLeads();
        return res.json({ data: leads });
    } catch (error) {
        console.error('Failed to list leads:', error);
        return res.status(500).json({ error: 'Failed to retrive leads', details: error.message });
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
        try {
            const { name, email, phone } = req.body;

            const lead = {
                id: `test-${Date.now()}`,
                name: name?.trim() || 'Unknown',
                email: email?.trim() || '',
                phone: phone?.trim() || '',
                createdAt: new Date().toISOString(),
            };

            const saved = await saveLead(lead);
            const publicLead = {
                id: saved.leadgen_id,
                name: saved.name,
                email: saved.email,
                phone: saved.phone,
                createdAt: saved.createdAt,
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