/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

index file used to define some npm settings

See the main file, main.js for additional comments. 

*/

const express = require("express");
const app = express();
const port = 4000;
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname)); 


const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); 
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); 
    }
});

const main = require('./routes/main');
app.use(express.json());
app.use('/', main);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})