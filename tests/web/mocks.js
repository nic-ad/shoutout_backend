let person1 = {
  email: "ali.halim@deptagency.com",
  country: "US",
  employeeId: 7115,
  name: "Ali Halim",
  team: "DPUS",
};

let person2 = {
  email: "boomi.integration@deptagency.com",
  country: "NA",
  employeeId: 3484,
  name: "Panda Boomi Test Bear",
  team: null,
};

let person3 = {
  email: "dwh-monitoring@deptagency.com",
  country: "NA",
  employeeId: 3483,
  name: "Panda DWH Test Bear",
  team: null,
};

const channel = { name: "peakon-test-channel", slackId: "C03HR04D338" };

const singleRecipientShoutout = {
  channel,
  elements: [
    { type: "text", text: "shoutout " },
    { text: "Danny", type: "user" },
  ],
};

const multiRecipientShoutout = {
  channel,
  elements: [
    { text: "Ali Halim", type: "user" },
    { type: "text", text: " " },
    { text: "Danny", type: "user" },
    { type: "text", text: " shoutout" },
  ],
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
  person1,
  person2,
  person3,
};
