const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v26.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

async function retrieveLead(leadgenId) {
    const token = process.env.META_PAGE_ACCESS_TOKEN;

    if (!token) {
        throw new Error(
            'META_PAGE_ACCESS_TOKEN is not set in environment variables'
        );
    }

    if (!leadgenId) {
        throw new Error('retrieveLead: leadgenId is required');
    }

    const url = `${GRAPH_API_BASE}/${encodeURIComponent(String(leadgenId))}?access_token=${encodeURIComponent(token)}`;
    console.log(`Retrieving lead ${leadgenId} from Meta Graph API...`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    let responseText;

    try {
        response = await fetch(url, { signal: controller.signal });
        responseText = await response.text();
    } catch (err) {
        if (err && err.name === 'AbortError') {
            throw new Error(`Meta Graph API timed out for lead ${leadgenId}`);
        }
        throw new Error(`Meta Graph API network error: ${err.message}`);
    } finally {
        clearTimeout(timeout);
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (err) {
        throw new Error(
            `Meta Graph API returned invalid JSON for lead ${leadgenId}`
        );
    }

    if (!response.ok) {
        const detail = data?.error?.message || 'no error message was returned';
        throw new Error(
            `Meta Graph API returned HTTP ${response.status} for lead ${leadgenId}: ${detail}`
        );
    }

    if (data.error) {
        throw new Error(
            `Meta Graph API error: ${data.error.message} (code ${data.error.code})`
        );
    }

    console.log(`Lead ${leadgenId} retrieved successfully`);
    return data;
}

module.exports = { retrieveLead };