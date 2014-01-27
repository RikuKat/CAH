(function() {
  var mongoose = require('mongoose');

  module.exports = function(app) {

    var playerPartialSchema = {
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
      },
      cardsInHand: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
      },
      cardsOnTable: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false
      },
      wonCards: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false
      },
    };

    var RoomSchema = mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      maxPlayers: {
        type: Number,
        required: true
      },
      cardsToWin: {
        type: Number,
        required: true
      },
      numberInHand: {
        type: Number,
        required: true
      },      
      pwHash: {
        type: String,
        required: false
      },
      players: {
        type: [playerPartialSchema],
        required: true
      },
      blackCard: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
      },
      blackCards: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
      },
      whiteCards: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
      },
      finished: {
        type: Boolean,
        required: true,
        default: false
      }
    });

    var Room = app.Room = mongoose.model('room', RoomSchema);

    Room.checkPassword = function(password, hash, callback) {
      if (!(password && hash)) {
        callback("Must pass password and hash", null);
      }
      return bcrypt.compare(password, hash, function(err, res) {
        if (err) {
          console.log(err);
        }
        return callback(err, res);
      });
    };

    Room.hashPassword = function(password, callback) {
      if (!password) {
        callback("Must pass a password");
      }
      return bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          console.log("Could not generate salt err: ", err);
          return callback(err);
        }
        return bcrypt.hash(password, salt, function(err, hash) {
          return callback(err, hash);
        });
      });
    };

  };
}).call(this);