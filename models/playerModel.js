(function() {

  var mongoose = require('mongoose');
  var bcrypt = require('bcrypt');

  module.exports = function(app) {

    var PlayerSchema = mongoose.Schema({
      user: {
        type: String,
        required: true,
        unique: true
      },
      name: {
        type: String,
        required: true
      },
      pwHash: {
        type: String,
        required: true
      },
      imageURL: {
        type: String,
        required: false
      },
      dscription: {
        type: String,
        required: false
      },
      timesWon: {
        type: Number,
        required: true,
        default: 0
      }
    });

    var Player = app.Player = mongoose.model('player', PlayerSchema);

    Player.checkPassword = function(password, hash, callback) {
      if (!(password && hash)) {
        callback("Requires both password and hash", null);
      }
      return bcrypt.compare(password, hash, function(err, res) {
        if (err) {
          console.log(err);
        }
        return callback(err, res);
      });
    };

  };
}).call(this);