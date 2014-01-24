(function() {

  var mongoose = require('mongoose');
  var passport = require('passport');
  var bcrypt = require('bcrypt');

  var WhiteCard = mongoose.model('whiteCard');
  var BlackCard = mongoose.model('blackCard');
  var Room = mongoose.model('room');
  var User = mongoose.model('user');

  module.exports = function(app) {


    //PLAYER/ACCOUNT MANAGEMENT

    app.post("/api/user/login", function(req, res, next) {

      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
          req.flash('error', 'Invalid password.');
          return res.redirect('/login');
        }
        req.login(user, function(err) {
          if (err) { return next(err); }
          console.info("remember me: "+req.body.rememberMe);
          return res.redirect('/api/user/' + user._id);
        });
      })(req, res, next);
    });

    app.get("/api/user/:id", function(req, res) {
      if (checkUser(req, res)) { return null; }
      console.log("id:" + req.params.id);
      return app.User.findById(req.params.id, function(err, user) {
        if (handleError(req, res, err)) { return null; }
        if (!user) {
          return res.redirect('/error/id');
        }

        user.firstName = app.decryptString(user.firstName);
        user.lastName = app.decryptString(user.lastName);
        return res.redirect('/');
      });

    app.all("/api/user/logout", function(req, res) {
      req.logout();
      req.flash('info', 'Successfully logged out')
      res.redirect('/');
    });


    //CARD CREATION AND EDIT

    app.post("/api/whiteCard/create", function(req, res) {
      var text = req.body.text;
      var imageURL = req.body.imageURL;
      if (!imageURL) {
        console.log("No imageURL provided for white card with text: ", text);
      }
      return WhiteCard.create({
        text: text,
        imageURL: imageURL
      }, function(err, card) {
        if (err) {
          console.log("Error when creating card with text: ", text);
          console.log("Err: ", err);
          return res.redirect("/error")
        } 
        req.flash('info', 'White card has been created with text: ' + card.text);
        return res.redirect("/whiteCard/create");
      });
    });

    app.post("/api/whiteCard/:id/edit", function(req, res) {
      var text = req.body.text;
      var imageURL = req.body.imageURL;
      if (!imageURL) {
        console.log("No imageURL provided for white card with text: ", text);
      }
      return WhiteCard.update({_id: req.params.id}, {
        text: text,
        imageURL: imageURL
      }, function(err, card) {
        if (err) {
          console.log("Error when creating card with text: ", text);
          console.log("Err: ", err);
          return res.redirect("/error")
        } 
        req.flash('info', 'White card has been created with text: ' + card.text);
        return res.redirect("/whiteCard/create");
      });
    });

    app.post("/api/blackCard/create", function(req, res) {
      var text = req.body.text;
      var imageURL = req.body.imageURL;
      if (!imageURL) {
        console.log("No imageURL provided for black card with text: ", text);
      }
      return BlackCard.create({
        text: text,
        imageURL: imageURL,
        pick: req.body.pick,
        draw: req.body.draw
      }, function(err, card) {
        if (err) {
          console.log("Error when creating card with text: ", text);
          console.log("Err: ", err);
          return res.redirect("/error")
        } 
        req.flash('info', 'Black card has been created with text: ' + card.text);
        return res.redirect("/blackCard/create");
      });
    });

    app.post("/api/whiteCard/:id/edit", function(req, res) {
      var text = req.body.text;
      var imageURL = req.body.imageURL;
      if (!imageURL) {
        console.log("No imageURL provided for white card with text: ", text);
      }
      return WhiteCard.update({_id: req.params.id}, {
        text: text,
        imageURL: imageURL
      }, function(err, card) {
        if (err) {
          console.log("Error when creating card with text: ", text);
          console.log("Err: ", err);
          return res.redirect("/error")
        } 
        req.flash('info', 'White card has been created with text: ' + card.text);
        return res.redirect("/whiteCard/create");
      });
    });



    //ROOM CREATION AND JOINING/LEAVING

    app.post("/api/room/create", function(req, res) {
      var title = req.body.title;
      var maxPlayers = req.body.maxPlayers;
      var numberInHand = req.body.numberInHand;
      var password = req.body.password;
      var cardsToWin = req.body.cardsToWin;
      var owner = req.user._id;  //cheeecccckkkk thisssssssssssssssssss
      var players;
      return WhiteCards.find({}, function(err, whiteCards) {
        if (err) {
          console.log("White cards find err: ", err)
          return res.redirect("/error")
        }
        if (!whiteCards || whiteCards === []) {
          console.log("No white cards found");
          return res.redirect("/error")
        }
        return BlackCards.find({}, function(err, blackCards) {
          if (err) {
            console.log("Black cards find err: ", err)
            return res.redirect("/error")
          }
          if (!blackCards || blackCards === []) {
            console.log("No black cards found");
            return res.redirect("/error")
          }
          return WhiteCards.drawHand(numberInHand, whiteCards, function(err, updatedWhiteCards, cards) {
            if (err) {
              console.log("Draw hand error for game owner: ", err);
              return res.redirect("/error");
            }
            players = {[{
              playerId: owner,
              cardsInHand: cards,
              cardsOnTable: [],
              wonCards: []
            }]};
            return Room.create({
              title: title,
              maxPlayers: maxPlayers,
              cardsToWin: cardsToWin,
              numberInHand: numberInHand,
              password: password,
              owner: owner,
              players: players,
              blackCards: blackCards,
              whiteCards: updatedWhiteCards,
            }, function(err, room) {
              if (err) {
                console.log("Error creating room: ", err;
                return res.redirect("/error")
              } 
              req.flash('info', 'Created Room: ' + room.title);
              return res.redirect("/room/" + room._id);              
            });
          });
        });
      });
    });

  };
}).call(this);
