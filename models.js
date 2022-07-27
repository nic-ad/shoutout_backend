const { Schema, model } = require('mongoose');

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
  image72: String,
  image192: String,
  image512: String,
});

const Person = model('Person', personSchema);

const elementSchema = new Schema({
  subtype: String,
  text: String,
  type: String,
});

elementSchema.add({ elements: [elementSchema] });

const messageSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
  },
  recipients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Person',
    },
  ],
  text: String,
  createDate: {
    type: Date,
    default: Date.now(),
  },
  channel: new Schema({ slackId: String, name: String }),
  elements: [elementSchema],
});

const Message = model('Message', messageSchema);

module.exports = { Person, Message };
