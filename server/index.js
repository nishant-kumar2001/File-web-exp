const axios = require('axios');
const { AuthType, createClient } = require("webdav");
const express = require("express");
const app = express();
const cors = require('cors');
// --------------------Modules----------------------


// WebDAV connection
const client = createClient("http://localhost:80/webdav/", {
    authType: AuthType.Digest,
    username: "fakeuser",
    password: "strongKey@221"
});


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


// start-server
app.listen(3001, () => {
    console.log("Server started listening at port 3001");
})