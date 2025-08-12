const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET;

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    throw new Error('MONGO_URI environment variable is not defined');
}
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// This function is defined but not used in the provided routes.
// It remains valid if you choose to use it later.
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) return reject(err);
            resolve(userData);
        });
    });
}

app.get('/api/test', (req, res) => {
    res.json('test ok');
});

// === MODIFIED FOR NEW SCHEMA ===
app.post('/api/register', async (req, res) => {
    // Destructure all the new fields from the request body
    const { firstName, lastName, username, email, password, avatar } = req.body;
    try {
        const userDoc = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
            avatar, // Add avatar (will be null/undefined if not provided)
        });
        res.status(201).json(userDoc);
    } catch (e) {
        res.status(422).json({ error: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({
                email: userDoc.email,
                id: userDoc._id,
                username: userDoc.username, // You can add more data to the token payload
            }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                // The full userDoc (with new fields) is returned upon login
                res.cookie('token', token).json(userDoc);
            });
        } else {
            res.status(422).json('Password not correct');
        }
    } else {
        res.status(404).json('User not found');
    }
});

// === MODIFIED FOR NEW SCHEMA ===
app.get('/api/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            // Find user by ID and send back the updated profile data
            const userDoc = await User.findById(userData.id);
            if (userDoc) {
                const { _id, firstName, lastName, username, email, avatar } = userDoc;
                res.json({ _id, firstName, lastName, username, email, avatar });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    } else {
        res.status(401).json({ error: 'No token provided' });
    }
});

app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

const port = 4000;

app.listen(port, () => {
    console.log(`Server is listening at port no ${port} 🚀`);
});