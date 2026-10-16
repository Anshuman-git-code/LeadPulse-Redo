require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { initializeRealtime, publishLead } = require('./realtime');

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
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

// Development-only test endpoint. Do not expose this unauthenticated route in production.
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