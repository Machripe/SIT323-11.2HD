const express = require('express');
const app = express();
const axios = require('axios')
const path = require('path');
const fs = require('fs');
const parse = require('node-html-parser').parse;

const port = 8080;

// FOR DEMONSTRATION PURPOSES - SHOULD BE STORED CLIENT-SIDE
var TOKEN = '';

// Connection information for Auth & API
let authURL = 'http://math-auth:49161';
let apiURL = 'http://math-api:49162';

async function loginAction(req, res) {
    const postobj = {
        username: req.query.username,
        password: req.query.password
    }
    await axios.post(`${authURL}/login`, postobj)
        .then(function (response) {
            TOKEN = response.data.token;
            console.log("Received token: " + TOKEN);
            res.sendFile(__dirname + "/dashboard.html");
        })
        .catch(function (error) {
            console.warn(error);
            return;
        })
    return 0;
}

async function registerAction(req, res) {
    const postobj = {
        username: req.query.username,
        password: req.query.password
    }
    await axios.post(`${authURL}/register`, postobj)
        .then(function (response) {
            TOKEN = response.data.token;
            res.sendFile(__dirname + "/dashboard.html");
        })
        .catch(function (error) {
            console.warn(error);
            return;
        })
    return 0;
}

function updateMessage(req, res, message) {
    let output = message == null ? "Invalid parameters missing or non-numeric" : message.toString();

    fs.readFile(__dirname + "/dashboard.html", 'utf8', (err, html) => {
        if (err) {
            throw err;
        }
        const root = parse(html);
        const span = root.querySelector('span');
        span.set_content(output);

        res.send(root.toString());
    })
}

async function mathAction(req, res, endpoint) {
    if (isNaN(req.query.num1) || isNaN(req.query.num2)) return;
    
    const headers = { 'Authorization': 'Bearer ' + TOKEN }
    const postobj = {
        num1: req.query.num1,
        num2: req.query.num2
    }
    await axios.post(`${apiURL}/${endpoint}`, postobj, { headers: headers })
        .then(function (response) {
            updateMessage(req, res, response?.data.result);            
        })
        .catch(function (error) {
            console.warn(error);
            return;
        })
    return 0;
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/loginaction', (req, res) => {
    if (req.query.login) loginAction(req, res);
    if (req.query.register) registerAction(req, res);
});

app.get('/mathaction', (req, res) => {
    switch (req.query.function) {
        case 'Addition':
            mathAction(req, res, 'add');
            break;
        case 'Multiplication':
            mathAction(req, res, 'multiply');
            break;
        case 'Subtraction':
            mathAction(req, res, 'subtract');
            break;
        case 'Division':
            mathAction(req, res, 'divide');
            break;
    }
});

app.listen(port, () => { console.log("Server listening on port " + port) });