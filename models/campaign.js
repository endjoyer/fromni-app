const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaignSchema = new Schema({
  channels: [String],
  message: {
    text: String,
    keyboard: {
      type: String,
      buttons: [{
        type: String,
        text: String,
        url: String
      }]
    }
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
