const http = require('http');
const app = require('./app');
require('dotenv').config();

const SERVER_PORT = 3000;

// Checks and returns the value of the port used
const normalizePort = (val) => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    else {
        return false;
    }
}

// Set current port value
const port = normalizePort(process.env.PORT || SERVER_PORT);

// Server port initialization
app.set('port', port);

// Checking server access errors
const serverError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }

    const address = server.address();
    const bind = typeof address === 'string' ? "pipe " + address : "port: " + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + 'requires evaluated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + 'is already in use.');
            process.exit(1);
            break;
        default:
            throw error;        
    }
}

// Server creation
const server = http.createServer(app);

// Server event listener initialization
server.on('error', serverError);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    console.log('Listen on ' + bind);
})

server.listen(port);