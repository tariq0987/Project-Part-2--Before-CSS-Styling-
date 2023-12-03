var express = require('express');
var router = express.Router();
const passport = require('passport');
let userModel = require('../models/user');
let User = userModel.User;

// Authentication Routes
router.get('/login', function(req, res, next){
    if(!req.user) {
        res.render('authentication/login', {
            title: 'Login',
            message: req.flash('loginMessage'),
            displayName: req.user ? req.user.displayName : ''
        });
    } else {
        return res.redirect('/'); // Redirect to home page
    }
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, User, info){
        if(err) {
            return next(err);
        }
        if(!User) {
            req.flash('loginMessage', 'Authentication Error');
            return res.redirect('/login');
        }
        req.login(User, (err) => {
            if(err) {
                return next(err);
            }
            return res.redirect('/'); // Redirect to home page after successful login
        });
    })(req, res, next);
});

router.get('/register', function(req, res, next){
    if(!req.user) {
        res.render('authentication/register', {
            title: 'Register',
            message: req.flash('registerMessage'),
            displayName: req.user ? req.user.displayName : ''
        });
    } else {
        return res.redirect('/'); // Redirect to home page
    }
});

router.post('/register', function(req, res, next){
    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        displayName: req.body.displayName
    });
    User.register(newUser, req.body.password, (err) => {
        if(err) {
            console.log("Error in inserting new User");
            if(err.name == 'UserExistError') {
                req.flash('registerMessage', 'Registration Error: User already Exists');
            }
            return res.render('authentication/register', {
                title: 'Register',
                message: req.flash('registerMessage'),
                displayName: req.user ? req.user.displayName : ''
            });
        } else {
            return passport.authenticate('local')(req, res, () => {
                res.redirect('/'); // Redirect to home page after successful registration
            });
        }
    });
});

router.get('/logout', function(req, res, next){
    req.logout(function(err){
        if(err) {
            return next(err);
        }
    });
    res.redirect('/'); // Redirect to home page after logout
});

// Nav Bar Routes
router.get('/', function(req, res, next) {
    res.render('home', { title: 'Home', displayName: req.user ? req.user.displayName : '' });
});
router.get('/aboutme', function(req, res, next) {
    res.render('aboutus', { title: 'About Me', displayName: req.user ? req.user.displayName : '' });
});
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Contact', displayName: req.user ? req.user.displayName : '' });
});

module.exports = router;
