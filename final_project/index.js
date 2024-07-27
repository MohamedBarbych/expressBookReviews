const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Setup session middleware
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided." });
    }

    jwt.verify(token, "", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Failed to authenticate token." });
        }

        req.username = decoded.username; // Store username in request for later use
        next(); // Proceed to the next middleware or route handler
    });
});

const PORT = 5000;

// Use customer routes
app.use("/customer", customer_routes);

// Use general routes
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));