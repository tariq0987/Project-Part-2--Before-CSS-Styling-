require('dotenv').config();
let nodemailer = require('nodemailer');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();

let mongoose = require('mongoose');
let URI = process.env.MONGODB_URI;
//mongoose.connect('mongodb://127.0.0.1:27017/test');
mongoose.connect(URI);
let mongodDB = mongoose.connection;
mongodDB.on("error", console.error.bind(console, "Connection Error"));
mongodDB.once("open", ()=>{console.log("MongoDB Connected")});

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// Authentication Section

let session = require('express-session');
let passport = require('passport');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
let flash = require('connect-flash');

// Creates a user model instance
let userModel = require('../models/user');
let User = userModel.User;

// Set-up Express-Session
app.use(session({
  secret: "SomeSecret",
  saveUninitialized: false,
  resave: false
}));

// Initialize flash-connect
app.use(flash());

// Implement user authentication
passport.use(User.createStrategy());

// Serialize and Deserialize user information
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware to attach displayName to res.locals
app.use((req, res, next) => {
  res.locals.displayName = req.user ? req.user.displayName : '';
  next();
});

//Routes Section

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let eidRouter = require('../routes/eid');
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/eidgiftlist', eidRouter);

// POST route from contact form
app.post('/send', (req, res) => {
  // Basic security check
  if(req.body.securityCheck !== '4') {
    res.send("Security check failed.");
    return;
  }

  // Creates a SMTP transporter object
  let transporter = nodemailer.createTransport({
    service: 'Outlook', 
    authentication: {
      user: process.env.EMAIL, // my hidden email for security purposes
      pass: process.env.EMAIL_PASSWORD // my hidden password for security purposes
    }
  });

  // Message object
  let message = {
    from: process.env.EMAIL, // my hidden email
    to: process.env.EMAIL, // my hidden email
    subject: 'New Message from ' + req.body.email, // Includes user's email in subject
    text: 'Name: ' + req.body.name + '\nEmail: ' + req.body.email + '\nMessage: ' + req.body.comments,
    html: '<p><b>Name:</b> ' + req.body.name + '</p><p><b>Email:</b> ' + req.body.email + '</p><p><b>Message:</b> ' + req.body.comments + '</p>'
  };

  // sends mail with defined transport object
  transporter.sendMail(message, (error, info) => {
    if (error) {
      res.send("Error occurred.");
      console.log('Error occurred. ' + error.message);
      return process.exit(1);
    }

    console.log('Message sent: %s', info.messageId);
    res.send("Message sent successfully!");
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // renders the error page
  res.status(err.status || 500);
  res.render('error', 
  {
    title: "Error"
  }
  );
});
  
module.exports = app;



