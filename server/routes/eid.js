var express = require('express');
var router = express.Router();
const giftController = require('../controllers/eid');
let mongoose = require('mongoose');

// Helper function for authentication
function requireAuthentication(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

// Get router for Read Operation
router.get('/', giftController.ReadgiftData);

// Get router for Create Operation --> Display the add gift page
router.get('/add', requireAuthentication, giftController.DisplayAddgift);

// Post router for Create Operation --> Process the add gift page
router.post('/add', requireAuthentication, giftController.Addgift);

// Get router for Edit/Update Operation --> Display the edit gift page
router.get('/edit/:id', requireAuthentication, giftController.DisplayEditgift);

// Post router for Edit/Update Operation --> Process the edit gift page
router.post('/edit/:id', requireAuthentication, giftController.Editgift);

// Get router for Delete Operation
router.get('/delete/:id', requireAuthentication, giftController.Deletegift);

module.exports = router;

