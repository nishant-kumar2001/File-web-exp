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
            renderFile(filename, files[i]);
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

    frame.addEventListener('contextmenu', (e) => showFolderMenu(e, info));
    frame.addEventListener('dblclick', (e) => {
        const link = document.createElement("a");
        link.target = "_blank";
        link.href = `<html>Directory contents</html>`;
        link.click();
        link.remove();
        console.log("Hello double click");
    });
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

    frame.addEventListener('contextmenu', (e) => showFileMenu(e, info));
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
var foldermenu = document.getElementById("folder-menu");
var filemenu = document.getElementById("file-menu");
var main = document.getElementById("main");
document.onclick = hideMenu;
main.oncontextmenu = viewerOnRightClick;

function hideMenu() {
    foldermenu.style.display = "none";
    filemenu.style.display = "none";
}

function showFileMenu(e, info) {
    foldermenu.style.display = "none";
    e.preventDefault();
    if (filemenu.style.display == "block") {
        filemenu.style.display = "none"
    }
    else {
        console.log(info);
        filemenu.style.display = "block";
        filemenu.style.left = e.pageX + "px";
        filemenu.style.top = e.pageY + "px";

        // file-download-option
        var downBtn = document.getElementById("fileDownload");
        var renameBtn = document.getElementById("rename");
        var delBtn = document.getElementById("delete");
        var cpyBtn = document.getElementById("filecopy");

        downBtn.onclick = (e) => {
            download(info.filename);
        }
        renameBtn.onclick = (e) => {
            let newname = prompt("Rename");
            console.log(newname);
        }
        delBtn.onclick = (e) => {
            e.preventDefault();
            let _confirm = window.confirm(`Are you sure for deleting "${info.filename}" permanently?`);
            if (_confirm) {
                location.reload();
                deletePath(info.filename);
            }
        }
        cpyBtn.onclick = (e) => {
            e.preventDefault();
            let dest = prompt("Copy to path");
            if (dest != null && dest != "") {
                cpyToPath(info, dest);
            }
        }
    }
}

function showFolderMenu(e, info) {
    filemenu.style.display = "none";
    e.preventDefault();
    if (foldermenu.style.display == "block") {
        foldermenu.style.display = "none"
    }
    else {
        console.log(info);
        foldermenu.style.display = "block";
        foldermenu.style.left = e.pageX + "px";
        foldermenu.style.top = e.pageY + "px";

        // file-download-option
        var newfoBtn = document.getElementById("fonewfolder");
        var fileupBtn = document.getElementById("fofileUpload");

        newfoBtn.onclick = (e) => {
            createFolder(e);
        };

        fileupBtn.onclick = (e) => {
            // fileUpload(info);
        };
    }
}

// on right click
// function viewerOnRightClick(e) {
//     e.preventDefault();
//     if (foldermenu.style.display == "block") {
//         foldermenu.style.display = "none";
//         filemenu.style.display = "none";
//     }
//     else {
//         foldermenu.style.display = 'block';
//         foldermenu.style.left = e.pageX + "px";
//         foldermenu.style.top = e.pageY + "px";
//     }
// }

// create folder
var newfolder = document.getElementById("newfolder");
newfolder.onclick = createFolder;

function createFolder(e) {
    foldermenu.style.display = "none";
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
function download(path) {
    var body = JSON.stringify({ "path": path });

    var downLink = new Request("http://localhost:3001/download", {
        method: 'POST',
        body: body,
        headers: new Headers({ "Content-Type": "application/json" })
    });
    fetch(downLink).then(function (res) {
        return res.json();
    }).then(function (url) {
        const link = document.createElement("a");
        link.target = "_blank";
        link.href = url.result;
        link.download = url.result;
        link.click();
        link.remove();
    });
}

//delete path
function deletePath(path) {
    const req = '{"path": "' + path + '"}';

    var deletePathReq = new Request("http://localhost:3001/delete", {
        method: 'POST',
        body: req,
        headers: new Headers({ 'Content-Type': 'application/json' })
    });

    fetch(deletePathReq).then(function (res) {
        if (res.ok) {
            alert(path + "Successfully deleted!");
        }
    }).catch(err => {
        alert("Server error: Unable to delete object");
    });
}

// copy to path
function cpyToPath(obj, dest) {
    console.log(`file: ${obj.filename} dest: ${dest}`);
    const req = '{"src": "' + obj.filename + '", "dest": "' + dest + '"}';

    console.log(req);
    var copyReq = new Request("http://localhost:3001/copy", {
        method: 'POST',
        body: req,
        headers: new Headers({ 'Content-Type': 'application/json' })
    });

    fetch(copyReq).then(function (res) {
        if (res.ok) {
            return res.json();
        }
    }).then(function (data) {
        console.log(data);
        alert(data.result.mssg);
    }).catch(err => {
        alert("Server error: Unable to delete object");
    });
}