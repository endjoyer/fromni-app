// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const campaignSchema = new Schema({
//   channels: [String],
//   message: {
//     text: String,
//     keyboard: {
//       type: String,
//       buttons: [{
//         type: String,
//         text: String,
//         url: String
//       }]
//     }
//   }
// });

// module.exports = mongoose.model('Campaign', campaignSchema);
const mongoose = require("mongoose");
const { Schema } = mongoose;

const buttonSchema = new Schema({
  text: String,
  url: String,
});

const keyboardSchema = new Schema({
  inline: Boolean,
  maxButtons: Number,
  maxButtonTextLength: Number,
  supportsLinks: Boolean,
  buttons: [buttonSchema],
});

const messageSchema = new Schema({
  text: String,
  keyboard: keyboardSchema,
});

const channelSchema = new Schema({
  name: String,
  selected: Boolean,
  maxMessageLength: Number,
  message: messageSchema,
});

const campaignSchema = new Schema({
  channels: [channelSchema],
});

module.exports = mongoose.model("Campaign", campaignSchema);
