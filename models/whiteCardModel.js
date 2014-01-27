(function() {
  var mongoose = require('mongoose');

  module.exports = function(app) {

    var WhiteCardSchema = mongoose.Schema({
      text: {
        type: String,
        required: true,
        unique: true
      },
      imageURL: {
        type: String,
        required: true,
        unique: true
      }
    });

    var WhiteCard = app.WhiteCard = mongoose.model('whiteCard', WhiteCardSchema);

    WhiteCard.draw = function(number, whiteCards, callback) {
      var hand = [];
      var err;
      for(ii=0; ii<number; ii++) {
        var index = Math.floor(Math.random()*whiteCards.length);
        var card = whiteCards[index];
        hand.push(card);
        whiteCards.splice(index, 1);
      }
      if (hand.length === number) {
        err = null;
      } else {
        err = "Card number incorrect, hand: " + hand.length;
      }
      return callback(err, whiteCards, hand);
    };

  };
}).call(this);