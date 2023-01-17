const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

const rateLimit = require('express-rate-limit');

const userRoute = require('./routes/user');
const sauceRoute = require('./routes/sauce');

require("dotenv").config();

// Initializing the Per-User Request Limiter
limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
	legacyHeaders: false,
});

//-------------------------

// Connection to the database
mongoose.connect(process.env.MONGODB_PATH,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Express initialization
const app = express(); 

app.use(helmet());

// Configuring server request access control
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Converting data to JSON format
app.use(express.json());

// Route for authentication
app.use('/api/auth', limiter, userRoute);
// Route for sauces data
app.use('/api/sauces', limiter, sauceRoute);
// Route for access to image files
app.use('/images/', express.static(path.join(__dirname, 'images')));

module.exports = app;

