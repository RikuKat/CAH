(function() {
  var mongoose = require('mongoose');

  module.exports = function(app) {

    var BlackCardSchema = mongoose.Schema({
      text: {
        type: String,
        required: true,
        unique: true
      },
      imageURL: {
        type: String,
        required: true,
        unique: true
      },
      pick: {
        type: Number,
        required: true,
        default: 1
      },
      draw: {
        type: Number,
        required: true,
        default: 0
      }
    });

    var BlackCard = app.BlackCard = mongoose.model('blackCard', BlackCardSchema);

  };
}).call(this);