let ioServer = null;

function initializeRealtime(io) {
    ioServer = io;
}

function publishLead(lead) {
    if (!ioServer) {
        throw new Error('Realtime server has not been initialized');
    }

    ioServer.emit('new-lead', lead);
    console.log(
        `New lead emitted to ${ioServer.engine.clientsCount} connected client(s)`
    );
}

module.exports = { initializeRealtime, publishLead };