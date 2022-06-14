const { Schema, model } = require("mongoose");

const personSchema = new Schema({
  employeeId: {
    type: Number,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  team: String,
  country: String,
  name: String,
});

const Person = model("Person", personSchema);

const messageSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "Person",
  },
  recipients: [
    {
      type: Schema.Types.ObjectId,
      ref: "Person",
    },
  ],
  text: String,
  createDate: {
    type: Date,
    default: Date.now(),
  },
});

const Message = model("Message", messageSchema);

module.exports = { Person, Message };
