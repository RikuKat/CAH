(function() {

  var mongoose = require('mongoose');
  var bcrypt = require('bcrypt');

  module.exports = function(app) {

    var UserSchema = mongoose.Schema({
      user: {
        type: String,
        required: true,
        unique: true
      }
      name: {
        type: String,
        required: true
      },
      pwHash: {
        type: String,
        required: true
      }
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

    var User = app.User = mongoose.model('user', UserSchema);

    User.checkPassword = function(password, hash, callback) {
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

    User.hashPassword = function(password, callback) {
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