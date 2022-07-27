const request = require('supertest');
const app = require('../../web');
const { Message } = require('../../models');
const { latestShoutoutsLimit } = require('../../utils/constants');
const {
  singleRecipientShoutout,
  getShoutoutTestTimestamp,
} = require('./mocks');
const setupData = require('../setup');

beforeAll(() => {
  return setupData('test-shoutouts');
});

describe('latest shoutouts', function () {
  const shoutoutTimestamp = getShoutoutTestTimestamp();

  beforeAll(() => {
    return async function () {
      await Message.create({
        ...singleRecipientShoutout,
        text: `oldest shoutout ${shoutoutTimestamp}`,
      });

      //insert our own shoutouts in case database has less than we need
      for (let i = 0; i < latestShoutoutsLimit; i++) {
        await Message.create({
          ...singleRecipientShoutout,
          text: `newer shoutouts ${shoutoutTimestamp}`,
        });
      }
    };
  });

  it(`should return ${latestShoutoutsLimit} shoutouts`, async function () {
    const response = await request(app).get('/shoutouts/latest');
    const results = response.body;

    expect(response.status).toBe(200);
    expect(results.length).toBe(latestShoutoutsLimit);
  });

  it(`should not include the oldest shoutout when given ${
    latestShoutoutsLimit + 1
  } of them`, async function () {
    const response = await request(app).get('/shoutouts/latest');
    const results = response.body;
    const oldestShoutout = results.find((result) =>
      result.text.includes('oldest shoutout'),
    );

    expect(response.status).toBe(200);
    expect(oldestShoutout).toBeFalsy();
  });
});

describe('shoutouts by year', function () {
  let mockShoutoutsPastTwelveMonths = [];
  const shoutoutTimestamp = getShoutoutTestTimestamp();
  const now = new Date();

  const withinTwelveMonths = new Date();
  withinTwelveMonths.setMonth(now.getMonth() - 11);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  function getTestShoutouts(results) {
    return results.filter((result) =>
      result.text.includes(`by-year shoutout ${shoutoutTimestamp}`),
    );
  }

  function getShoutoutsWithinTwelveMonths(shoutout) {
    return (
      shoutout.inPastTwelveMonths == true &&
      new Date(shoutout.createDate) >= twelveMonthsAgo
    );
  }

  beforeAll(() => {
    return async function () {
      const mockByYearShoutout = {
        ...singleRecipientShoutout,
        text: `by-year shoutout ${shoutoutTimestamp}`,
      };

      mockShoutoutsPastTwelveMonths = [
        {
          //now
          ...mockByYearShoutout,
          createDate: now,
        },
        {
          //within 12 months
          ...mockByYearShoutout,
          createDate: withinTwelveMonths,
        },
      ];

      await Message.create(mockShoutoutsPastTwelveMonths[0]);
      await Message.create(mockShoutoutsPastTwelveMonths[1]);

      //2021
      await Message.create({
        ...mockByYearShoutout,
        createDate: new Date('2021-06-25'),
      });

      //2020
      await Message.create({
        ...mockByYearShoutout,
        createDate: new Date('2020-07-27'),
      });

      await Message.create({
        ...mockByYearShoutout,
        createDate: new Date('2020-12-31'),
      });

      //1991
      await Message.create({
        ...mockByYearShoutout,
        createDate: new Date('1991-03-23'),
      });
    };
  });

  it('should return only shoutouts for the given year', async () => {
    const year = '2020';
    const response = await request(app).get(`/shoutouts/by-year?year=${year}`);
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);
    const shoutoutsFromYear = testShoutouts.filter(
      (shoutout) => shoutout.year == year,
    );

    expect(response.status).toBe(200);
    expect(testShoutouts.length).toBe(2);
    expect(shoutoutsFromYear.length).toBe(2);
  });

  it('should return all shoutouts from the past 12 months by default when no year requested', async function () {
    const response = await request(app).get('/shoutouts/by-year');
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);
    const shoutoutsInPastTwelveMonths = testShoutouts.filter(
      getShoutoutsWithinTwelveMonths,
    );

    expect(response.status).toBe(200);
    expect(testShoutouts.length).toBe(mockShoutoutsPastTwelveMonths.length);
    expect(shoutoutsInPastTwelveMonths.length).toBe(
      mockShoutoutsPastTwelveMonths.length,
    );
  });

  it('should not return any shoutouts when given year has none', async function () {
    const year = '2002';
    const response = await request(app).get(`/shoutouts/by-year?year=${year}`);
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);

    expect(response.status).toBe(200);
    expect(testShoutouts.length).toBe(0);
  });

  it('should return all shoutouts from the past 12 months by default when invalid (non-number) year is given', async function () {
    const year = '200X';
    const response = await request(app).get(`/shoutouts/by-year?year=${year}`);
    const results = response.body;
    const testShoutouts = getTestShoutouts(results);
    const shoutoutsInPastTwelveMonths = testShoutouts.filter(
      getShoutoutsWithinTwelveMonths,
    );

    expect(response.status).toBe(200);
    expect(shoutoutsInPastTwelveMonths.length).toBe(
      mockShoutoutsPastTwelveMonths.length,
    );
  });
});
