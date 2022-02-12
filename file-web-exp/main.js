var viewer = document.getElementById("viewer");

// add data from stream
function fetchData() {
    var fetchReq = new Request("http://localhost:3001/", {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'json' })
    });
    fetch(fetchReq).then(function (res) {
        return res.json();
    }).then(function (data) {
        let files = [];
        let folders = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item["type"] == "file") {
                files.push(item);
            }
            else if (item["type"] == "directory") {
                folders.push(item);
            }
        }

        for (let i = 0; i < folders.length; i++) {
            var filename = folders[i]["filename"];
            filename = filename.substr(1);
            renderFolder(filename, folders[i]);
        }

        for (let i = 0; i < files.length; i++) {
            var filename = files[i]["filename"];
            filename = filename.substr(1);
            renderFile(filename, folders[i]);
        }
    });
}

fetchData();

// to show dirs
function renderFolder(name, info) {
    let card = document.createElement('div');
    card.className = "col-md col-lg-2 col-xl-3 py-2";

    let frame = document.createElement('div');
    frame.className = "card shadow-sm";

    let block = document.createElement("div");
    block.className = "card-block";
    block.textContent = `${name}`;

    frame.appendChild(block);
    card.appendChild(frame);
    viewer.appendChild(card);
}

// to show files
function renderFile(name, info) {
    let card = document.createElement('div');
    card.className = "col-sm col-lg-2 col-xl-2 py-2 fileClass";

    let frame = document.createElement('div');
    frame.className = "card shadow-none";

    let block = document.createElement("div");
    block.className = "card-block";
    block.textContent = `${name}`;

    frame.oncontextmenu = showFileMenu;
    frame.appendChild(block);
    card.appendChild(frame);
    viewer.appendChild(card);
}

// floating action button
var button = document.getElementById("button");
button.onclick = clickAdd;

function clickAdd() {
    // add floating text field for creating directory
    // button.appendChild();
    alert("To be implemented!");
}

// context menu - inside viewer
var menu = document.getElementById("context-menu")
var filemenu = document.getElementById("file-menu")
var main = document.getElementById("main");
document.onclick = hideMenu;
main.oncontextmenu = viewerOnRightClick;

function hideMenu() {
    menu.style.display = "none"
    filemenu.style.display = "none"
}

function showFileMenu(e) {
    e.preventDefault();
    if (filemenu.style.display == "block")
    hideMenu;
    else {
        filemenu.style.display = "block";
        filemenu.style.left = e.pageX + "px";
        filemenu.style.top = e.pageY + "px";
    }
}

function viewerOnRightClick(e) {
    e.preventDefault();
    if (menu.style.display == "block")
        hideMenu();
    else {
        menu.style.display = 'block';
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
    }
}

// create folder
var newfolder = document.getElementById("newfolder");
newfolder.onclick = createFolder;

function createFolder(e) {
    menu.style.display = "none";
    let path = prompt("Name", "New Folder");

    if (path != null && path != "") {
        path = "/" + path;
        const req = '{"path": "' + path + '"}';

        e.preventDefault();
        var newFolderReq = new Request("http://localhost:3001/mkdir", {
            method: 'POST',
            body: req,
            headers: new Headers({ 'Content-Type': 'application/json' })
        });

        fetch(newFolderReq).then(function (res) {
            alert("Folder " + path + " created successfully!");
        }).catch(err => {
            alert("Server error: Unable to create folder");
        });
    }
}

// file download
function download() {
    const downloadLink = client.getFileDownloadLink("/image.png")
}