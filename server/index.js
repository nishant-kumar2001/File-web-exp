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
    var items;
    try {
        items = await client.getDirectoryContents("/");
        console.log(`Content request: ${items.length}`);
    } catch (error) {
        console.log(`Error fetching document`);
    }
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

    if (path != "" && path != null) {
        const downloadLink = client.getFileDownloadLink(path)
        res.json({ result: downloadLink });
        return;
    }

    res.sendStatus(401);
});

app.post('/delete', async (req, res) => {
    const { path } = req.body;

    if (path != null && path != "") {
        await client.deleteFile(path);
        res.json({ result: `File/Folder ${path} successfully deleted` });
        return;
    }
    res.sendStatus(401);
});

app.post('/copy', async (req, res) => {
    const { src, dest } = req.body;

    if (src != null && src != "" && dest != null && dest != "") {
        await client.copyFile(src, dest);
        res.json({ result: {mssg: `moved from ${src} to ${dest}`, src: src, dest: dest}} );
        return;
    }
    res.sendStatus(401);
});

// start-server
const server = app.listen(3001, () => {
    console.log("Server started listening at port 3001");
})

// to kill previously enabled servers on error
// setInterval(() => server.getConnections(
//     // (err, connections) => console.log(`${connections} connections currently open`)
//     (err, connections) => {}
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
//         // console.log('Closed out remaining connections');
//         process.exit(0);
//     });

//     setTimeout(() => {
//         // console.error('Could not close connections in time, forcefully shutting down');
//         process.exit(1);
//     }, 10000);

//     connections.forEach(curr => curr.end());
//     setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
// }