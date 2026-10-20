require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const webhookRouter = require('./webhook');
const { initializeRealtime, publishLead } = require('./realtime');

const app = express();

app.get('/health', (req, res) => {
    const healthcheck = {
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: Date.now()
    };
    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = 'error';
        healthcheck.message = error.message;
        res.status(503).json(healthcheck);
    }
});

// Preserve the original request bytes for HMAC validation.
app.use(
    '/webhook/meta',
    express.raw({ type: 'application/json', limit: '1mb' }),
    webhookRouter
);

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
    app.post('/test/lead', (req, res) => {
        const { name, email, phone } = req.body || {};

        const lead = {
            id: `test-${Date.now()}`,
            name: name || 'Unknown',
            email: email || '',
            phone: phone || '',
            createdAt: new Date().toISOString(),
        };

        publishLead(lead);
        res.status(201).json({ success: true, lead });
    });
}

const PORT = Number(process.env.PORT || 3000);

httpServer.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});