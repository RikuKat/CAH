
(function() {

  var express = require('express');
  var http = require('http');
  var https = require('https');
  var path = require('path');
  var fs = require('fs');

  var jade = require('jade');
  var stylus = require('stylus');

  var connect = require('connect');
  var roles = require('connect-roles');

  var passport = require('passport');
  var passportLocalStrategy = require('passport-local').Strategy;
  var mongoose = require('mongoose');
  var passportLocalMongoose = require('passport-local-mongoose');

  var bcrypt = require('bcrypt');

  var flash = require('express-flash')

  var app = module.exports = express();

  var MongoStore = require('connect-mongo')(express);


  /*
  # Configuration
  */

  app.configure(function() {
    app.set("hostname", process.env.HOSTNAME || os.hostname());
    app.set("port", process.env.PORT || 3000);
    app.set("views", __dirname + "/views");
    app.set("currentDirectory", __dirname);
    app.set("view engine", "jade");
    // Force SSL
    if (app.get("env") === "development") {
      app.use(function (req, res, next) {
        res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');
        if (!req.secure) {
          console.log("request not secure: redirecting");
          return res.redirect(301, 'https://' + req.host  + ":" + process.env.PORT + req.url);
        } else {
          return next();
        }
      });
    } else {
      app.use(function (req, res, next) {
        res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');
        if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
          return res.redirect(301, 'https://' + req.host + req.url);
        } else {
          return next();
        }
      });
    }
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.query());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: "5201f8893469a4961889fb0a",
      cookie: {
        maxAge: 604800000, // 1 Week
        expires: 604800000
      },
      store: new MongoStore({
        db: "tabulaRasa",
        url: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost/tabulaRasa"
      })
    }));
    app.use(passport.initialize());
    app.use(passport.session({ cookie: { maxAge: 60000 }}));

    // Allow REST api calls to take user/pass
    // erika
    app.use(function(req, res, next) {
      // Already logged in?
      if (req.user) {
        return next();
      }
      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
          return next();
        }
        req.login(user, function(err) {
          if (err) { return next(); }
          return next();
        });
      })(req, res, next);
    });

    app.use(flash());
    app.use(app.router);
    app.use(express.staticCache());
    app.use(express.static(path.join(__dirname, "public")));

  });

  if (app.get("env") === "development") {
    app.use(express.errorHandler());
    console.log("Dev Environment");
  }

  if (app.get("env") === "production") {
    console.log("Prod Environment");
    require('newrelic');
    console.log("Initialized New Relic Node.js Agent");
    if (!process.env.APPNAME) {
      console.log("APPNAME config variable not set. Please set this to something using heroku config:set APPNAME=<appname> --app <appname>");
    }
  }

  passport.use(new passportLocalStrategy({
    usernameField: 'user'
  }, function(username, password, done) {
    console.log("local user: " + username);
//    console.log("local pass: " + password);
    return app.User.findOne({
      user: username
    }, function(err, user) {
      if (err) {
        console.log("error: " + err);
      }
      if (user) {
        console.log("user: " + user);
      }
      if (err) {
        return done(err);
      }
      if (!user) {
        console.log('invalid user: ');
        return done(null, false, {
          message: "Incorrect username."
        });
      }
      return app.User.checkPassword(password, user.pwHash, function(err, res) {
        if (res) {
          return done(null, user);
        }
        console.log('invalid password: ' + password);
        return done(null, false, {
          message: "Incorrect password."
        });
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    return mongoose.model('user').findById(id, function(err, user) {
      return done(err, user);
    });
  });

  // Add the data services
  require('./app/services/dataServices/dataService')(app);

  // load Models
  recursive_require.loadAllFilesRecursively(app, '/models');

  // load Routes
  recursive_require.loadAllFilesRecursively(app, '/');
 
  /*
  # Start Server
  */

  var privateKey = fs.readFileSync('./localhost.key').toString();
  var certificate = fs.readFileSync('./localhost.crt').toString();

  var options = {
    key : privateKey
    , cert : certificate
  };

  var port = process.env.PORT || 3000; // Used by Heroku and http on localhost
  process.env['PORT'] = process.env.PORT || 4000; // Used by https on localhost

  http.createServer(app).listen(port, function() {
    return console.log("Express server listening on port " + port); //app.get("port")
  });

  // Run separate https server if on localhost
  if (app.get("env") === "development") {
    https.createServer(options, app).listen(process.env.PORT, function () {
      console.log("Express server listening with https on port %d in %s mode", process.env.PORT, app.settings.env);
    });
  }

}).call(this);
