import { ShoutoutsModule } from './shoutouts.module';
import * as request from 'supertest';
import {
  closeDatabase,
  getShoutoutTestUuid,
  initTests,
  insertSingleRecipientShoutout,
} from '../test/utils';
import { LATEST_SHOUTOUTS_LIMIT } from '../constants';

describe('ShoutoutsService', () => {
  let mocks: any;
  let mockApp: any;

  beforeAll(async () => {
    mocks = await initTests(ShoutoutsModule);
    mockApp = mocks.app.getHttpServer();
  });

  describe('latest shoutouts', function () {
    const shoutoutUuid = getShoutoutTestUuid();

    beforeAll(async () => {
      await insertSingleRecipientShoutout({
        uuid: shoutoutUuid,
        text: 'oldest shoutout',
      });

      //insert our own shoutouts in case database has less than we need
      for (let i = 0; i < LATEST_SHOUTOUTS_LIMIT; i++) {
        await insertSingleRecipientShoutout({
          uuid: shoutoutUuid,
          text: 'newest shoutouts',
        });
      }
    });

    it(`should return ${LATEST_SHOUTOUTS_LIMIT} shoutouts`, async function () {
      const response = await request(mockApp).get('/shoutouts/latest');
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(LATEST_SHOUTOUTS_LIMIT);
    });

    it(`should not include the oldest shoutout when given ${
      LATEST_SHOUTOUTS_LIMIT + 1
    } of them`, async function () {
      const response = await request(mockApp).get('/shoutouts/latest');
      const results = response.body;
      const oldestShoutout = results.find((result) => result.text.includes('oldest shoutout'));

      expect(response.status).toBe(200);
      expect(oldestShoutout).toBeFalsy();
    });
  });

  describe('shoutouts by year', function () {
    let mockShoutoutsPastTwelveMonths = [];
    const mockByYearShoutoutText = 'by-year shoutout';
    const shoutoutUuid = getShoutoutTestUuid();
    const now = new Date();

    const withinTwelveMonths = new Date();
    withinTwelveMonths.setMonth(now.getMonth() - 11);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    function getTestShoutouts(results) {
      return results.filter((result) =>
        result.text.includes(`${mockByYearShoutoutText} ${shoutoutUuid}`),
      );
    }

    function getShoutoutsWithinTwelveMonths(shoutout) {
      return new Date(shoutout.createDate) >= twelveMonthsAgo;
    }

    beforeAll(async () => {
      const mockByYearShoutout = {
        ...mocks.data.singleRecipientShoutout,
        uuid: shoutoutUuid,
        text: mockByYearShoutoutText,
      };

      mockShoutoutsPastTwelveMonths = [
        //now
        {
          ...mockByYearShoutout,
          createDate: now,
        },
        //within 12 months
        {
          ...mockByYearShoutout,
          createDate: withinTwelveMonths,
        },
      ];

      await insertSingleRecipientShoutout(mockShoutoutsPastTwelveMonths[0]);
      await insertSingleRecipientShoutout(mockShoutoutsPastTwelveMonths[1]);

      //2021
      await insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('2021-06-25'),
      });

      //2020
      await insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('2020-07-27'),
      });

      await insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('2020-12-31'),
      });

      //1991
      await insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('1991-03-23'),
      });
    });

    it('should return only shoutouts for the given year', async () => {
      const year = 2020;
      const response = await request(mockApp).get(`/shoutouts/by-year?year=${year}`);
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);
      const shoutoutsFromYear = testShoutouts.filter(
        (shoutout) => new Date(shoutout.createDate).getFullYear() == year,
      );

      expect(response.status).toBe(200);
      expect(testShoutouts.length).toBe(2);
      expect(shoutoutsFromYear.length).toBe(2);
    });

    it('should return all shoutouts from the past 12 months by default when no year requested', async function () {
      const response = await request(mockApp).get('/shoutouts/by-year');
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);
      const shoutoutsInPastTwelveMonths = testShoutouts.filter(getShoutoutsWithinTwelveMonths);

      expect(response.status).toBe(200);
      expect(testShoutouts.length).toBe(mockShoutoutsPastTwelveMonths.length);
      expect(shoutoutsInPastTwelveMonths.length).toBe(mockShoutoutsPastTwelveMonths.length);
    });

    it('should not return any shoutouts when given year has none', async function () {
      const year = '2002';
      const response = await request(mockApp).get(`/shoutouts/by-year?year=${year}`);
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);

      expect(response.status).toBe(200);
      expect(testShoutouts.length).toBe(0);
    });

    it('should return all shoutouts from the past 12 months by default when invalid (non-number) year is given', async function () {
      const year = '200X';
      const response = await request(mockApp).get(`/shoutouts/by-year?year=${year}`);
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);
      const shoutoutsInPastTwelveMonths = testShoutouts.filter(getShoutoutsWithinTwelveMonths);

      expect(response.status).toBe(200);
      expect(shoutoutsInPastTwelveMonths.length).toBe(mockShoutoutsPastTwelveMonths.length);
    });
  });

  afterAll(async () => {
    await closeDatabase();
    await mocks.app.close();
  });
});
