const express = require('express');
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Initialisation du router
const router = express.Router();

// Routing of URIs for sauce data with 'auth' for access control and multer for downloaded files
router.get('/', auth, sauceCtrl.findAllSauces);
router.get('/:id', auth, sauceCtrl.findOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.modifyLike);

module.exports = router;