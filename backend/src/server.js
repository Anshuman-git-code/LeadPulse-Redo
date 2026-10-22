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
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return res.status(400).json({
                success: false,
                error: 'Request body must be a JSON object',
            });
        }

        for (const field of ['name', 'email', 'phone']) {
            if (body[field] !== undefined && typeof body[field] !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: `${field} must be a string`,
                });
            }
        }

        const { name, email, phone } = body;
        const lead = {
            id: `test-${Date.now()}`,
            name: name?.trim() || 'Unknown',
            email: email?.trim() || '',
            phone: phone?.trim() || '',
            createdAt: new Date().toISOString(),
        };

        publishLead(lead);
        return res.status(201).json({ success: true, lead });
    });
}

const PORT = Number(process.env.PORT || 3000);

httpServer.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});