const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// connect to database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.log(error));

// returns a valid port wether it is a number or a string
const normalizePort = val => {
    const port = parseInt(val, 10);

    // if port is not a number
    if (isNaN(port)) {
        return val;
    }

    // if port is a number
    if (port >= 0) {
        return port;
    }
    
    // if port is not a number nor a string
    return false;
};

const port = normalizePort(process.env.PORT);

// set the port to express app
app.set('port', port);

const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    };

    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; 
    
    switch (error.code) {

        // if port is protected
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        
        // if port already in use
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;

        // if error is not handled
        default:
            throw error;
    }
};

// create a server with the express app
const server = http.createServer(app);

// listening errors events
server.on('error', errorHandler);

// record the port where the server is listening
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);