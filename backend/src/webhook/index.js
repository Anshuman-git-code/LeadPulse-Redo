const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { retrieveLead } = require('../meta');
const { normalizeLead } = require('../leads');
const { publishLead } = require('../realtime');
const { saveLead } = require('../leads/repository');

// Meta calls this GET route while verifying the callback URL in its dashboard.
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const expectedToken = process.env.META_VERIFY_TOKEN;

    if (
        mode === 'subscribe' &&
        expectedToken &&
        token === expectedToken &&
        challenge !== undefined
    ) {
        console.log('Webhook verification successful — challenge returned');
        return res.status(200).send(String(challenge));
    }

    console.warn('Webhook verification rejected');
    return res.sendStatus(403);
});

function isValidMetaSignature(rawBody, signature, appSecret) {
    if (!Buffer.isBuffer(rawBody)) return false;
    if (typeof signature !== 'string' || !signature.startsWith('sha256=')) {
        return false;
    }

    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

    const receivedBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

router.post('/', (req, res) => {
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret) {
        console.error('META_APP_SECRET is not configured');
        return res.sendStatus(500);
    }

    const signature = req.get('x-hub-signature-256');

    // req.body must still be the original raw Buffer here.
    if (!isValidMetaSignature(req.body, signature, appSecret)) {
        console.warn('Webhook rejected: invalid X-Hub-Signature-256');
        return res.sendStatus(403);
    }

    let payload;
    try {
        payload = JSON.parse(req.body.toString('utf8'));
    } catch (error) {
        console.warn('Webhook rejected: invalid JSON body');
        return res.status(400).send('Invalid JSON body');
    }

    // Signature and JSON are valid. Acknowledge before the slower Graph API call.
    res.sendStatus(200);

    processLeadEvents(payload).catch((error) => {
        console.error('Unexpected webhook processing error:', error.message);
    });
});

async function processLeadEvents(payload) {
    const entries = Array.isArray(payload?.entry) ? payload.entry : [];

    for (const entry of entries) {
        const changes = Array.isArray(entry?.changes) ? entry.changes : [];

        for (const change of changes) {
            if (change?.field !== 'leadgen') {
                continue;
            }

            const leadgenId = change?.value?.leadgen_id;
            if (!leadgenId) {
                console.warn('Received a leadgen event without leadgen_id');
                continue;
            }

            console.log('Lead event received: leadgen_id:', leadgenId);

            try {
                const rawLead = await retrieveLead(String(leadgenId));
                const lead = normalizeLead(rawLead);
                const saved = await saveLead(lead);
                publishLead({
                    id: saved.leadgenId,
                    name: saved.name,
                    email: saved.email,
                    phone: saved.phone,
                    createdAt: saved.createdAt.toISOString(),
                });
            } catch (error) {
                // The 200 response has already been returned to Meta. Log any
                // later processing failure for diagnosis in the backend terminal.
                console.error(
                    `Failed to process lead ${leadgenId}:`,
                    error.message
                );
            }
        }
    }
}

module.exports = router;