const request = require("supertest");
const app = require("../../web");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const { Message } = require("../../models");
const { latestShoutoutsLimit} = require("../../utils/constants");
const { singleRecipientShoutout, getShoutoutTestTimestamp } = require("./mocks");

describe("latest shoutouts", function(){
  const shoutoutTimestamp = getShoutoutTestTimestamp();

  before("insert test shoutouts", async function(){
    await Message.create({
      ...singleRecipientShoutout,
      text: `oldest shoutout ${shoutoutTimestamp}`
    });

    //insert our own shoutouts in case database has less than we need
    for(let i = 0; i < latestShoutoutsLimit; i++){
      await Message.create({
        ...singleRecipientShoutout,
        text: `newer shoutouts ${shoutoutTimestamp}`
      });
    }
  });

  it(`should return ${latestShoutoutsLimit} shoutouts`, async function(){
    const response = await request(app).get("/shoutouts/latest");
    const results = response.body;

    expect(response.status).to.equal(200);
    expect(results.length).to.equal(latestShoutoutsLimit);
  });

  it(`should not include the oldest shoutout when given ${latestShoutoutsLimit + 1} of them`, async function(){
    const response = await request(app).get("/shoutouts/latest");
    const results = response.body;
    const oldestShoutout = results.find(result => result.text.indexOf("oldest shoutout") > -1);

    expect(response.status).to.equal(200);
    should.not.exist(oldestShoutout);
  });
});

describe("shoutouts by year", function(){
  const shoutoutTimestamp = getShoutoutTestTimestamp();
  const now = new Date();

  const withinTwelveMonths = new Date();
  withinTwelveMonths.setMonth(now.getMonth() - 11);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const mockByYearShoutout = {
    ...singleRecipientShoutout,
    text: `by-year shoutout ${shoutoutTimestamp}`
  };

  const mockShoutoutsPastTwelveMonths = [
    {
      //now
      ...mockByYearShoutout,
      createDate: now
    },
    {
      //within 12 months
      ...mockByYearShoutout,
      createDate: withinTwelveMonths
    }
  ];

  function getTestShoutouts(results){
    return results.filter(result => result.text.indexOf(`by-year shoutout ${shoutoutTimestamp}`) > -1);
  }

  function getShoutoutsWithinTwelveMonths(shoutout){
    return (shoutout.inPastTwelveMonths == true) && (new Date(shoutout.createDate) >= twelveMonthsAgo);
  }

  before("insert mock shoutouts for various times", async function(){
    await Message.create(mockShoutoutsPastTwelveMonths[0]);
    await Message.create(mockShoutoutsPastTwelveMonths[1]);

    //2021
    await Message.create({
      ...mockByYearShoutout,
      createDate: new Date("2021-06-25")
    });

    //2020
    await Message.create({
      ...mockByYearShoutout,
      createDate: new Date("2020-07-27")
    });

    await Message.create({
      ...mockByYearShoutout,
      createDate: new Date("2020-12-31")
    });

    //1991
    await Message.create({
      ...mockByYearShoutout,
      createDate: new Date("1991-03-23")
    });
  });

  it("should return only shoutouts for the given year", async function(){
    const year = "2020";
    const response = await request(app).get(`/shoutouts/by-year?year=${year}`);
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);
    const shoutoutsFromYear = testShoutouts.filter(shoutout => shoutout.year == year);

    expect(response.status).to.equal(200);
    expect(testShoutouts.length).to.equal(2);
    expect(shoutoutsFromYear.length).to.equal(2);
  });

  it("should return all shoutouts from the past 12 months by default when no year requested", async function(){
    const response = await request(app).get("/shoutouts/by-year");
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);
    const shoutoutsInPastTwelveMonths = testShoutouts.filter(getShoutoutsWithinTwelveMonths);

    expect(response.status).to.equal(200);
    expect(testShoutouts.length).to.equal(mockShoutoutsPastTwelveMonths.length);
    expect(shoutoutsInPastTwelveMonths.length).to.equal(mockShoutoutsPastTwelveMonths.length);
  });

  it("should not return any shoutouts when given year has none", async function(){
    const year = "2002";
    const response = await request(app).get(`/shoutouts/by-year?year=${year}`);
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);

    expect(response.status).to.equal(200);
    expect(testShoutouts.length).to.equal(0);
  });

  it("should return all shoutouts from the past 12 months by default when invalid (non-number) year is given", async function(){
    const year = "200X";
    const response = await request(app).get(`/shoutouts/by-year?year=${year}`);
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);
    const shoutoutsInPastTwelveMonths = testShoutouts.filter(getShoutoutsWithinTwelveMonths);

    expect(response.status).to.equal(200);
    expect(shoutoutsInPastTwelveMonths.length).to.equal(mockShoutoutsPastTwelveMonths.length);
  });
});