const express = require('express');
const userCtrl = require('../controllers/user');

const router = express.Router();

// Routage des URI pour l'authentification
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;