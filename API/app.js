const express = require('express');
const app = express();
const port = 3001;

const passport = require('passport');
require('./passport.js')(passport);

// Simulate authorization levels using binary bit flags to allow for easily fine tuning access to individual features
const revokedTokens = new Map();

app.use(express.json());
app.use((err, req, res, next) => {
    res.status(400).json({ status: 400, message: "Invalid JSON format" })
});

function addition(a, b) { return a + b }
function multiplication(a, b) { return a * b }
function subtraction(a, b) { return a - b }
function division(a, b) { return a / b }

function performMath(req, res, callback) {
    const { num1, num2 } = req.body;
    if (isNaN(num1) || isNaN(num2)) return res.status(400).json({ status: 400, message: "Invalid parameters (non-numeric)" });
    var result = callback(parseFloat(num1), parseFloat(num2));
    res.status(200).json({ status: 200, type: callback.name, input: [num1, num2], result: result });
}

app.use(passport.initialize());

// Authenticates supplied token and provides custom error messages
function authenticateToken(req, res, next) {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
        if (user == false) {
            if (info.name === "TokenExpiredError") return res.status(400).json({ status: 400, message: "Authentication Failure: Expired token" });
            if (info.name === "JsonWebTokenError") return res.status(400).json({ status: 400, message: "Authentication Failure: Invalid token" });
            if (info.name === "Error") return res.status(400).json({ status: 400, message: "Authentication Failure: Missing token" });
            return res.status(400).json({ status: 400, message: "Authentication Failure: General" });
        }

        // Check if token revoked
        if (revokedTokens.has(user)) return res.status(403).json({ status: 403, message: "Authentication Failure: Access revoked" });

        req.user = user;
        next();
    })(req, res);
}

app.post("/add", authenticateToken, (req, res) => { performMath(req, res, addition); })
app.post("/multiply", authenticateToken, (req, res) => { performMath(req, res, multiplication); })
app.post("/subtract", authenticateToken, (req, res) => { performMath(req, res, subtraction); });
app.post("/divide", authenticateToken, (req, res) => { performMath(req, res, division); })

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => console.log('listening on port:' + port));