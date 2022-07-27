const { Person } = require("../models");
const mongoose = require("mongoose");
const {
  person1,
  person2,
  person3,
  singleRecipientShoutout,
  multiRecipientShoutout,
} = require("./web/mocks");

async function setupPerson(person) {
  try {
    const response = await Person.findOneAndUpdate(
      { employeeId: person.employeeId },
      { $setOnInsert: person },
      { upsert: true, new: true }
    );
    person._id = response._doc._id.toString(); //_id is an object if you don't use toString() for some reason
  } catch (error) {
    console.error(error);
  }
}

before(async function () {
  mongoose.connect("mongodb://localhost:27017/test");
  await setupPerson(person1);
  await setupPerson(person2);
  await setupPerson(person3);

  singleRecipientShoutout.authorId = person1._id;
  singleRecipientShoutout.author = new mongoose.Types.ObjectId(person1._id);
  singleRecipientShoutout.recipients = new mongoose.Types.ObjectId(person3._id);
  singleRecipientShoutout.recipientIds = [person3._id];

  multiRecipientShoutout.authorId = person2._id;
  multiRecipientShoutout.author = new mongoose.Types.ObjectId(person2._id);
  multiRecipientShoutout.recipients = [
    new mongoose.Types.ObjectId(person1._id),
    new mongoose.Types.ObjectId(person3._id),
  ];
  multiRecipientShoutout.recipientIds = [person1._id, person3._id];
});
