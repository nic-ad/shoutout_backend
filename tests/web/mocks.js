const mongoose = require("mongoose");

const personId1 = "62a8b18fac66b6ab6077fadb";
const personId2 = "62a8dc13455b30483c2c6b54";
const personId3 = "62a8dc13455b30483c2c686c";
const channel = { name: "peakon-test-channel", slackId: "C03HR04D338" };

const singleRecipientShoutout = {
  authorId: personId1, //not part of official model
  author: new mongoose.Types.ObjectId(personId1),
  channel,
  elements: [
    { type: "text", text: "shoutout " },
    { text: "Danny", type: "user" },
  ],
  recipients: [new mongoose.Types.ObjectId(personId3)],
  recipientIds: [personId3], //not part of official model
};

const multiRecipientShoutout = {
  authorId: personId2, //not part of official model
  author: new mongoose.Types.ObjectId(personId2),
  channel,
  elements: [
    { text: "Ali Halim", type: "user" },
    { type: "text", text: " " },
    { text: "Danny", type: "user" },
    { type: "text", text: " shoutout" },
  ],
  recipients: [
    new mongoose.Types.ObjectId(personId1),
    new mongoose.Types.ObjectId(personId3),
  ],
  recipientIds: [personId1, personId3], //not part of official model
};

//******
//returns fresh identifier used in the shoutout text for tests so that no matter the users involved in the shoutouts or what is in the
//database at the time of test runs, we have a unique key to look for so that we can filter on / care about only those shoutouts for test assertions
//******
const getShoutoutTestTimestamp = () => Date.now() + Math.random();

module.exports = {
  singleRecipientShoutout,
  multiRecipientShoutout,
  getShoutoutTestTimestamp,
};
