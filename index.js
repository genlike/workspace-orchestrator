require('log-timestamp');
const express = require('express');
const pg = require('pg');
var fs = require('fs');
var uuid = require('uuid');
var getDirName = require('path').dirname;
var requestIp = require('request-ip');
var chokidar = require('chokidar');

const hostfs = 'file:///c:/Users/ricar/Documents/Projectos/workspace-orchestrator/';

var hostname = '0.0.0.0';
var port = 3010;
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    switch (index) {
        case 2:
            hostname = val;
            break;
        case 3:
            port = parseInt(val);
            break;
        
        default:
            break;
    }
  });




const remoteServerAddress = "192.168.1.120";

const app = express();


// const db = pg.createConnection({
//     host:       'localhost',
//     user:       'root',
//     password:   'rootroot'
// });




function createWatcher(path){
    var watcher = chokidar.watch(path, {ignored: /^\./, persistent: true});
    watcher
    .on('add', function(path) {
        console.log('File', path, 'has been added');
        //addFileToDb(path);
    })
    .on('change', function(path) {
       
        console.log('File', path, 'has been changed');
        //readFileToUpdate(path);
    })
    .on('unlink', function(path) {
        console.log('File', path, 'has been removed');
        //deleteFileFromDb(path);
    })
    .on('error', function(error) {console.error('Error happened', error);});
    return watcher;
}


var currentEditors = {};

setInterval(() =>
{
    for (const [key, value] of Object.entries(currentEditors)) {
        console.log(key + value + 'Time Diff' + (Date.now() - value[1]));
        //If last update was 5 min ago

        if(Date.now() - value[1]>5*1000*60){
            console.log("unwatch this" + value[0].substr(66));
            value[2].unwatch(value[0].substr(66));
            value[2].close().then(() => {
                
                delete currentEditors[key];
                fs.readdir(value[0].substr(66), (error, files)=> {
                    if(error){
                        console.log(error);
                    } else {
                        files.forEach(file => {
                            console.log(file);
                          });
                    }
                });
                fs.rmdir(value[0].substr(66)+'/..',{recursive: true}, (error) => {console.log(error)});
            });
        }
      }
}, 60000);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://' + remoteServerAddress + ':3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.listen(port, hostname, () => {
    console.log('Server started at port ' + port)
})


function createWorkspace(ip){
    let randomFoldername = 'tmp/WS-' + uuid.v4() + '/Workspace';
    //let randomFoldername = 'tmp/Workspace';
     fs.mkdir(randomFoldername, {recursive: true},(err) => {
         if (err) throw err;
     });
    currentEditors[ip] = [hostfs + randomFoldername, Date.now(), createWatcher(randomFoldername)];
    //pullFilesFromDb(randomFoldername,3);
}

function pullFilesFromDb(path, param){
    let sql = 'SELECT f.filescol filename, f.file file FROM itlang.files f';
    db.query(sql,[], (err, result, fields) => {
        if(err) throw err;
        Object.keys(result).forEach(function(key) {
            saveToFile(path,result[key])
          });
    });
    
}



function saveToFile(path, row) {
    const buff = Buffer.from(row.file, "binary");
    console.log("Trying to write: " + path +"/"+row.filename);


    fs.mkdir(getDirName(path +'/'+row.filename), { recursive: true}, function (err) {
        if (err) return cb(err);
        fs.writeFile(path +'/'+row.filename, buff, { flag: 'w+'}, function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
        });
        
      });


    
    
}

function updateBufferToDb(buffer, filename){
    let sql = 'UPDATE itlang.files SET ? WHERE filescol = ?';
    db.query(sql,[{
        filescol: filename,
        file: buffer
    }, filename], (err, result, fields) => {
        if( err) throw err;
        console.log("Updated file:" + filename + " Affected Fields: " + result.changedRows);
        
    });
}

function readFileToUpdate(filename){
    console.log("readFileToUpdate: " + filename);
    fs.stat(filename, function (error, stats) {
  
        // 'r' specifies read mode
        fs.open(filename, "r", function (error, fd) {
            var buffer = new Buffer.alloc(stats.size);
            fs.read(fd, buffer, 0, buffer.length,
                null, function (error, bytesRead, buffer) {
                    updateBufferToDb(buffer, filename.substr(54));
                });
        });
    });
}

function insertBufferToDb(buffer, filename){
    let sql = 'INSERT INTO itlang.files SET ?';
    db.query(sql,{
        filescol: filename,
        file: buffer
    }, (err, result, fields) => {
        if( err) throw err;
        console.log("Updated file");
    });
}

function deleteFileFromDb(filename){
    let sql = 'DELETE FROM itlang.files WHERE filescol = ?';
    db.query(sql,[filename.substr(54)], (err, result, fields) => {
        if( err) throw err;
        console.log("Deleted file");
    });
}


function addFileToDb(filename){
    let sql = 'SELECT f.filescol filename, f.file file FROM itlang.files f WHERE f.filescol = ?';
    db.query(sql,[filename.substr(54)], (err, result, fields) => {
        if(err) throw err;
        if(result.length==0){
            console.log("addFileToDb: " + filename);
            fs.stat(filename, function (error, stats) {
                // 'r' specifies read mode
                fs.open(filename, "r", function (error, fd) {
                    var buffer = new Buffer.alloc(stats.size);
                    fs.read(fd, buffer, 0, buffer.length,
                        null, function (error, bytesRead, buffer) {
                            insertBufferToDb(buffer, filename.substr(54));
                        });
                });
            });
        }
    });
    
}





app.get('/createTempWorkspace', (req, res) => {
    let ip = requestIp.getClientIp(req);

    createWorkspace(ip);
    res.statusCode = 200;
    //res.redirect('http://' + remoteServerAddress + ':3000/');
    res.end();

});


app.get('/testCommunication', (req, res) => {
    let filename = req.query.filename;
    // filename = filename.substring(filename.length -100);
    console.log("trying to update in db " + filename);

    //readFileToUpdate(filename);
// let status = req.query.status;
// // console.log(status);
// switch (status) {
//     case '1':
//         console.log("STATUS CODE 1");
//         break;
//     case '2':
//         console.log("STATUS CODE 2");
//             break;
//     default:
//         break;
// }

res.statusCode = 200;
res.setHeader('Content-Type', 'text/plain');
res.send("Test Communication");
res.end();

});

app.get('/getWorkspace', (req, res) => {
    let ip = requestIp.getClientIp(req);
    console.log(currentEditors);
    console.log(ip);
    if(!(ip in currentEditors)){
        createWorkspace(ip);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.send(currentEditors[ip][0]);
    res.end();
});


app.get('/ping', (req, res) => {
    let ip = requestIp.getClientIp(req);
    //console.log("PING FROM");
    if(currentEditors[ip]) currentEditors[ip][1] =  Date.now();
    //console.log(currentEditors);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.send("detected workspace of" + ip);
    res.end();

});