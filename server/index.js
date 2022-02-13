const axios = require('axios');
const { AuthType, createClient } = require("webdav");
const express = require("express");
const app = express();
const cors = require('cors');
// --------------------Modules----------------------


// WebDAV connection
// const client = createClient("http://localhost:80/webdav/", {
//     authType: AuthType.Password,
//     username: "fakeuser",
//     password: "strongKey@221"
// });
const client = createClient("http://localhost:80/webdav/");


// middleware
app.use(cors());
app.use(express.json());


// application-routes
app.get('/', async (req, res) => {
    console.log("Content request");
    const items = await client.getDirectoryContents("/");
    console.log(items.length);
    res.json(items);
});

app.post('/mkdir', async (req, res) => {
    const { path } = req.body;
    console.log(`New folder request: ${path}`);

    await client.createDirectory(path);
    res.send(`directory ${path}`);
});

app.post('/download', async (req, res) => {
    const { path } = req.body;
    console.log(`download item request: ${path}`);

    const downloadLink = client.getFileDownloadLink(path)
    res.json({result: downloadLink});
});


// start-server
const server = app.listen(3001, () => {
    console.log("Server started listening at port 3001");
})

// to kill previously enabled servers on error
// setInterval(() => server.getConnections(
//     (err, connections) => console.log(`${connections} connections currently open`)
// ), 1000);

// process.on('SIGTERM', shutDown);
// process.on('SIGINT', shutDown);

// let connections = [];

// server.on('connection', connection => {
//     connections.push(connection);
//     connection.on('close', () => connections = connections.filter(curr => curr !== connection));
// });

// function shutDown() {
//     console.log('Received kill signal, shutting down gracefully');
//     server.close(() => {
//         console.log('Closed out remaining connections');
//         process.exit(0);
//     });

//     setTimeout(() => {
//         console.error('Could not close connections in time, forcefully shutting down');
//         process.exit(1);
//     }, 10000);

//     connections.forEach(curr => curr.end());
//     setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
// }