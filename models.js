const { Schema, model } = require("mongoose");

const personSchema = new Schema({
  email: String,
  slack_id: String,
  slack_name: String,
});

const Person = model("Person", personSchema);

const messageSchema = new Schema({
  author: personSchema,
  recipients: [personSchema],
  text: String,
});

const Message = model("Message", messageSchema);

module.exports = { Person, Message };
