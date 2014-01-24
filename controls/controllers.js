(function() {

  var mongoose = require('mongoose');
  var passport = require('passport');
  var bcrypt = require('bcrypt');

  var WhiteCard = mongoose.model('whiteCard');
  var BlackCard = mongoose.model('blackCard');
  var Room = mongoose.model('room');
  var User = mongoose.model('user');

  module.exports = function(app) {

    //GENERIC PAGES

    app.get("/", function(req, res) {
      return res.render("index", {
        user: req.user
      });
    });   

    app.get("/error", function(req, res) {
      return res.render("error", {
        user: req.user
      });
    });

    //ACCOUNT MANAGEMENT
    app.get("/register", function(req, res) {  //might want to force a logout
      return res.render("register");
    }); 

    app.get("/login", function(req, res) {  //might want to force a logout
      return res.render("login");
    }); 

    //CARD CREATION AND EDITING

    app.get("/whiteCard/create", function(req, res) {
      return res.render("whiteCardCreate", {
        user: req.user
      });
    });

    app.get("/whiteCard/edit/:id", function(req, res) {
      var id = req.params.id;
      return WhiteCard.findById(id, function(err, card) {
        if (err) {
          console.log("Could not find white card with id: ", id);
          console.log("Err: ", err);
          return res.redirect("/error");
        }
        return res.render("whiteCardEdit", {
          user: req.user,
          card: card
        }); 
      });
    });

    app.get("/blackCard/create", function(req, res) {
      return res.render("blackCardCreate", {
        user: req.user
      });
    });

    app.get("/blackCard/edit/:id", function(req, res) {
      var id = req.params.id;
      return BlackCard.findById(id, function(err, card) {
        if (err) {
          console.log("Could not find black card with id: ", id);
          console.log("Err: ", err);
          return res.redirect("/error");
        }
        return res.render("blackCardEdit", {
          user: req.user,
          card: card
        }); 
      });
    });

    app.get("/room/create", function(req, res) {
      if (!user) {
        return res.redirect("/roomCreate")
      }
      return res.render("roomCreate", {
        user: req.user
      });
    });

  };
}).call(this);
