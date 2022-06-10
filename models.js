const { Schema, model } = require("mongoose");

const personSchema = new Schema({
  employeeId: {
    type: Number,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  slackId: {
    type: String,
    unique: true
  },
  team: String,
  country: String,
  name: String
});

const Person = model("Person", personSchema);

const messageSchema = new Schema({
  author: personSchema,
  recipients: [personSchema],
  text: String,
});

const Message = model("Message", messageSchema);

module.exports = { Person, Message };
