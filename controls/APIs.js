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
          return res.redirect('/');
        });
      })(req, res, next);
    });

    app.all("/api/user/logout", function(req, res) {
      req.logout();
      req.flash('info', 'Successfully logged out')
      res.redirect('/');
    });

    app.post("/api/user/create", function(req, res) {
      var user = req.body.user;
      var name = req.body.name
      var imageURL = req.body.imageURL;
      var description = req.body.description;
      return User.hashPassword(req.body.password, function(err, hash) {
        if (err) {
          console.log("Failed to hash password");
          return res.redirect("/error");
        }
        return User.create({
          user: user,
          name: name,
          pwHash: hash,
          imageURL: imageURL,
          description: description
        }, function(err, user) {
          if (err) {
            console.log("Create user err: ", err);
          }
          console.log("saved user");
          req.login(user, function(err) {
            if (err) {
              console.log('Failed to login err: ', err);
            }
            req.flash('success', 'User ' + user.user + ' successfully registered.');
            return res.redirect('/');
          });
        });        
      });
    });

    //CARD CREATION AND EDIT

    app.post("/api/whiteCard/create", function(req, res) {
      //if (user.user !== 'RikuKat') { return res.redirect('/error'); }
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
      //if (user.user !== 'RikuKat') { return res.redirect('/error'); }
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
      //if (user.user !== 'RikuKat') { return res.redirect('/error'); }
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
      //if (user.user !== 'RikuKat') { return res.redirect('/error'); }
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
      var numberInHand = parseInt(req.body.numberInHand);
      var password = req.body.password;
      var cardsToWin = req.body.cardsToWin;
      var players;
      return WhiteCard.find({}, function(err, whiteCards) {
        if (err) {
          console.log("White cards find err: ", err)
          return res.redirect("/error")
        }
        if (!whiteCards || whiteCards === []) {
          console.log("No white cards found");
          return res.redirect("/error")
        }
        return BlackCard.find({}, function(err, blackCards) {
          if (err) {
            console.log("Black cards find err: ", err)
            return res.redirect("/error")
          }
          if (!blackCards || blackCards === []) {
            console.log("No black cards found");
            return res.redirect("/error")
          }
          return WhiteCard.drawHand(numberInHand, whiteCards, function(err, updatedWhiteCards, cards) {
            if (err) {
              console.log("Draw hand error for game owner: ", err);
              return res.redirect("/error");
            }
            players = [{
              playerId: req.user._id,
              cardsInHand: cards,
              cardsOnTable: [],
              wonCards: []
            }];
            return Room.create({
              title: title,
              maxPlayers: maxPlayers,
              cardsToWin: cardsToWin,
              numberInHand: numberInHand,
              pwHash: hash,
              players: players,
              blackCards: blackCards,
              whiteCards: updatedWhiteCards,
            }, function(err, room) {
              if (err) {
                console.log("Error creating room: ", err);
                return res.redirect("/error")
              } 
              req.flash('info', 'Created Room: ' + room.title);
              return res.redirect("/room/" + room._id);              
            });
          });
        });
      });
    });

    app.post("/api/room/join/:id", function(req, res) {
      var id = req.params.id;
      return Room.findById(id, function(err, room) {
        if (err) {
          console.log("Could not find room: ", id);
          console.log("Err: ", err);
        }
        return WhiteCard.drawHand(room.numberInHand, room.whiteCards, function(err, updatedWhiteCards, cards) {
          if (err) {
            console.log("Draw hand error during joining: ", err);
            return res.redirect("/error");
          }
          player = {
            playerId: user._id,
            cardsInHand: cards,
            cardsOnTable: [],
            wonCards: []
          };
          room.players.push(player);
          return Room.update({_id: id},{
            players: room.players,
            whiteCards: updatedWhiteCards
          }, function(err, room) {
            if (err) {
              console.log("Error joining room: ", err);
              return res.redirect("/error")
            } 
            req.flash('info', 'Joined Room: ' + room.title);
            return res.redirect("/room/" + room._id);              
          });
        });
      });
    });

    app.post("/api/room/leave/:id", function(req, res) {
      var id = req.params.id;
      return Room.findById(id, function(err, room) {
        if (err) {
          console.log("Could not find room: ", id);
          console.log("Err: ", err);
        }
        for (ii=0; ii<room.players.length; ii++) {
          if (room.players[ii].playerId === user._id) {  //may need to convert to string
            room.players.splice(ii, 1);
            console.log("Removed player: " + room.players[ii].playerId);
            break;
          }
          if (ii === room.players.length-1) {
            console.log("Could not find player to remove");
            req.flash('error', 'May not have left following room properly: ' + room.title);
            return res.redirect("/");
          }
        }
        req.flash('info', 'Left room: ' + room.title);
        return res.redirect("/");              
      });
    });

  };
}).call(this);
