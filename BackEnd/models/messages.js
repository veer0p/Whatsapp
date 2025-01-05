// models/messages.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  time: String,
  sender: String,
  content: String,
  status: String,
});

const conversationSchema = new mongoose.Schema({
  date: String,
  conversation_id: Number,
  messages: [messageSchema],
  name: String,
  whatsapp_name: String,
  phone_number: String,
});

// Create a model based on the conversation schema
const Messages = mongoose.model("Messages", conversationSchema);

// Export the model
module.exports = Messages;
