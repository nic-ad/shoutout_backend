const request = require("supertest");
const app = require("../../web");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const { Message } = require("../../models");
const {
  singleRecipientShoutout,
  multiRecipientShoutout,
  getShoutoutTestTimestamp,
} = require("./mocks");

describe("profile search by name/email", function () {
  it("should find only profiles whose name contains the search query", async function () {
    const searchQuery = "TesT";
    const response = await request(app).get(
      `/profile/search?name=${searchQuery}`
    );
    const results = response.body;
    const resultWithoutQueryInName = results.find(
      (profile) =>
        !profile.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    expect(response.status).to.equal(200);
    expect(results.length).to.be.above(0);
    should.not.exist(resultWithoutQueryInName);
  });

  it("should find only profiles whose email contains the search query", async function () {
    const searchQuery = "booMi";
    const response = await request(app).get(
      `/profile/search?email=${searchQuery}`
    );
    const results = response.body;
    const resultWithoutQueryInEmail = results.find(
      (profile) => profile.email.indexOf(searchQuery.toLowerCase()) < 0
    );

    expect(response.status).to.equal(200);
    expect(results.length).to.be.above(0);
    should.not.exist(resultWithoutQueryInEmail);
  });

  it("should return correct match for the given full name search", async function () {
    const searchQuery = "Panda Boomi Test Bear";
    const response = await request(app).get(
      `/profile/search?name=${searchQuery}`
    );
    const results = response.body;

    expect(response.status).to.equal(200);
    expect(results.length).to.equal(1);
    expect(results[0].name).to.equal(searchQuery);
  });

  it("should return correct match for the given full email search", async function () {
    const searchQuery = "boomi.integration@deptagency.com";
    const response = await request(app).get(
      `/profile/search?email=${searchQuery}`
    );
    const results = response.body;

    expect(response.status).to.equal(200);
    expect(results.length).to.equal(1);
    expect(results[0].email).to.equal(searchQuery);
  });

  it("should return no results given garbage search query", async function () {
    const response = await request(app).get(
      "/profile/search?name=alakjdsnlasnljkanlksnadlnaksnda"
    );
    const results = response.body;

    expect(response.status).to.equal(200);
    expect(results.length).to.equal(0);
  });

  it("should have same number of results from name + email search as when each searched separately", async function () {
    const searchQuery = "john";

    const togetherResults = await request(app).get(
      `/profile/search?name=${searchQuery}&email=${searchQuery}`
    );

    const nameResults = await request(app).get(
      `/profile/search?name=${searchQuery}`
    );
    const emailResults = await request(app).get(
      `/profile/search?email=${searchQuery}`
    );

    const namePlusEmailResults = [...nameResults.body, ...emailResults.body];
    const distinctResults = [
      ...new Set(namePlusEmailResults.map((result) => result._id)),
    ];

    expect(togetherResults.body.length).to.equal(distinctResults.length);
  });

  it("should limit large response to 100 results", async function () {
    const response = await request(app).get("/profile/search?name=a");
    const results = response.body;

    expect(response.status).to.equal(200);
    expect(results.length).to.equal(100);
  });

  it("should return 500 given invalid search", async function () {
    const response = await request(app).get("/profile/search?name=?");
    expect(response.status).to.equal(500);
  });
});

describe("profile search by id", function () {
  it("should return correct result given valid id", async function () {
    //const searchId = "62a5dbc1b0a35dbb2dae40fa";prod
    const searchId = "62a8dc14455b30483c2c72e1"; //non-prod
    const response = await request(app).get(`/profile/${searchId}`);
    const result = response.body;

    expect(response.status).to.equal(200);
    expect(result.userInfo.name).to.equal("Panda DWH Test Bear");
  });

  it("should return no results given id that is in valid format but that doesn't belong to anyone", async function () {
    const searchId = "999999999999999999999999";
    const response = await request(app).get(`/profile/${searchId}`);
    const result = response.body;

    expect(response.status).to.equal(200);
    should.not.exist(result.userInfo.name);
  });

  it("should return 500 given id in invalid format", async function () {
    const searchId = "9";
    const response = await request(app).get(`/profile/${searchId}`);

    expect(response.status).to.equal(500);
  });
});

async function expectShoutoutReceived(shoutoutTimestamp, recipientId) {
  const response = await request(app).get(`/profile/${recipientId}`);
  const result = response.body;

  //should find a single shoutout because only one has the timestamp of this test run
  const testShoutoutsReceived = result.shoutoutsReceived.filter(
    (shoutout) => shoutout.text.indexOf(shoutoutTimestamp) > -1
  );

  expect(response.status).to.equal(200);
  expect(testShoutoutsReceived.length).to.equal(1);
  expect(testShoutoutsReceived[0].recipients[0]._id).to.equal(recipientId);
}

describe("single-recipient shoutout on user profiles", function () {
  const shoutoutTimestamp = getShoutoutTestTimestamp();

  before(async function () {
    await Message.create({
      ...singleRecipientShoutout,
      text: `single shoutout ${shoutoutTimestamp}`,
    });
  });

  it("author profile should have shoutout given with self as author", async function () {
    const response = await request(app).get(
      `/profile/${singleRecipientShoutout.authorId}`
    );
    const result = response.body;
    const testShoutoutsGiven = result.shoutoutsGiven.filter(
      (shoutout) => shoutout.text.indexOf(shoutoutTimestamp) > -1
    );

    expect(response.status).to.equal(200);
    expect(testShoutoutsGiven.length).to.equal(1);
    expect(testShoutoutsGiven[0].author._id).to.equal(
      singleRecipientShoutout.authorId
    );
  });

  it("recipient profile should have shoutout received with self as recipient", async function () {
    const recipientId = singleRecipientShoutout.recipientIds[0];
    await expectShoutoutReceived(shoutoutTimestamp, recipientId);
  });
});

describe("multi-recipient shoutout on user profiles", function () {
  const shoutoutTimestamp = getShoutoutTestTimestamp();

  before(async function () {
    await Message.create({
      ...multiRecipientShoutout,
      text: `multi shoutout ${shoutoutTimestamp}`,
    });
  });

  it("recipient profiles should each have shoutout received with self as recipient", async function () {
    const recipientId1 = multiRecipientShoutout.recipientIds[0];
    const recipientId2 = multiRecipientShoutout.recipientIds[1];

    await expectShoutoutReceived(shoutoutTimestamp, recipientId1);
    await expectShoutoutReceived(shoutoutTimestamp, recipientId2);
  });
});
