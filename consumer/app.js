'use strict';
// imports
const log4js = require('log4js');
const logger = log4js.getLogger('OrbitLogger');
const bodyParser = require('body-parser');
const http = require('http')
const express = require('express')
const app = express();
const cors = require('cors');
const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const {Config} = require('./config/config')
const {createIdentity} = require('orbit-db-identity-provider')
const {onShutdown} = require('node-graceful-shutdown')
// logic
const setbroadcast = require('./logic/setbroadcast')
const getaddress = require('./logic/getaddress')
const getmultiaddress = require('./logic/getmultiaddress')
const getdata = require('./logic/getdata')
const getalldata = require('./logic/getalldata')
const storedata = require('./logic/storedata')
// server settings
const host = "localhost";
const port = "4000";
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
logger.level = 'debug';
let intervalHandle;
// singleton
let connection = {
    ipfs: null,
    orbitdb: null,
    database: null
}

// server start
var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 240000;

// enpoints
app.get('/disconnect', async function (req, res) {
    try {
        console.info('Shutdown IPFS and OrbitDB...')
        if (intervalHandle) {
            clearInterval(intervalHandle);
        }
        await connection.orbitdb.stop()
        await connection.ipfs.stop()
        console.info('Shutdown Completed')

        let message = 'OrbitDB shutdown successful';

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.post('/connect', async function (req, res) {
    try {
        logger.debug('==================== BOOTING IPFS ==================');
        console.info('Booting IPFS...')
        console.info('Connecting to IPFS daemon', JSON.stringify(Config))
        connection.ipfs = await Ipfs.create(Config)
        const id = await connection.ipfs.id()
      
        console.info('\n===========================================')
        console.info('IPFS booted')
        console.info('-------------------------------------------')
        console.info(id)
        console.info('===========================================\n\n')
      
        connection.ipfs.libp2p.on('peer:disconnect', (peerId) => {
          console.info('Lost Connection"', JSON.stringify(peerId.id))
        })
      
        connection.ipfs.libp2p.on('peer:connect', (peer) => {
          console.info('Producer Found:', peer.id)
        })
      
        // If you don't know the IP of the connected counter part on the beginning,
        // you can add it dynamically, i.e. using a kind of handshake
        //await ipfs.bootstrap.add("/ip4/104.197.35.15/tcp/4001/p2p/QmVE331tpJCpqXuKvjMcdEeko1NdoWgM78eQXZn6Vn5ii8")
        
        logger.debug('==================== CONNECTING TO ORBITDB ==================');
        console.info('Starting OrbitDb...')
        // This is a way to create an OrbitDB identity based on external ids!
        const identity = await createIdentity({id: 'privateKey'});
        connection.orbitdb = await OrbitDB.createInstance(connection.ipfs, {identity})
        console.info(`Orbit Database instantiated ${JSON.stringify(connection.orbitdb.identity)}`)
        console.info('-------------------------------------------')
        // Granting write access to all
        connection.database = await connection.orbitdb.docstore('producer', {
            accessController: {
            write: ["*"]
            }
        })
        console.info('-------------------------------------------')
        await connection.database.load(1)
        
        console.info('\n===========================================')
        console.info('Database initialized')
        console.info(`Address: ${connection.database.address}`)
        console.info('===========================================')

        subscribeDatabaseUpdates(connection)

        let message = 'OrbitDB successfully deployed';

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.get('/clean', async function (req, res) {
    try {
        console.info('Deleting OrbitDB...')
        await connection.database.drop()
        await connection.database.load()
        let message = 'OrbitDB locally deleted';

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

function publishIpfsMessage(topic) {
    connection.pubsub.publish(topic, msg => console.info(msg.data.toString()))
    console.info(`published [${message.toString()}] to ${topic}`)
}

function subscribeDatabaseUpdates(connection) {
    connection.database.events.on('replicate', (address, {payload}) => {
        console.info(`${address} updated database`, JSON.stringify(payload))
    })
}

app.get('/getaddress', async function (req, res) {
    try {
        logger.debug('==================== GET ORBITDB ADDRESS ==================');

        let message = await getaddress.getDbAddress(connection);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.get('/getmultiaddress', async function (req, res) {
    try {
        logger.debug('==================== GET ORBITDB MULTIADDRESS ==================');

        let message = await getmultiaddress.getmultiaddress(connection);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.get('/getalldata', async function (req, res) {
    try {
        logger.debug('==================== GETTING ALL DATA FROM ORBITDB ==================');

        let message = await getalldata.getalldata(connection);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.post('/setbroadcast', async function (req, res) {
    try {
        logger.debug('==================== SET BROADCAST TO ORBITDB ==================');

        let message = "endpoint not implemented";

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.post('/getdata', async function (req, res) {
    try {
        logger.debug('==================== GET DATA FROM ORBITDB ==================');

        let message = await getdata.getdata(connection, req);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.post('/storedata', async function (req, res) {
    try {
        logger.debug('==================== STORE DATA INTO IPFS ==================');

        let message = await storedata.storeData(connection, req);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

