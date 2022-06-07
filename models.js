const { Schema, model } = require("mongoose");

const personSchema = new Schema({ slack_id: String });
const Person = model("Person", personSchema);

const messageSchema = new Schema({
  author: personSchema,
  text: String,
  recipients: [personSchema],
});
const Message = model("Message", messageSchema);

module.exports = { Person, Message };
