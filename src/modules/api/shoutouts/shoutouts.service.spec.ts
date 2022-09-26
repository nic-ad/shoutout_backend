import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { LATEST_SHOUTOUTS_LIMIT } from '../constants';
import { MockService } from '../test/mock.service';
import { getShoutoutTestUuid, initTestingModule } from '../test/utils';
import { ShoutoutsModule } from './shoutouts.module';

describe('ShoutoutsService', function () {
  let mockAppServer: any;
  let mockApp: INestApplication;
  let mockService: MockService;

  beforeAll(async function () {
    const mockModule: TestingModule = await initTestingModule(ShoutoutsModule);
    mockService = await mockModule.resolve(MockService);
    mockApp = mockModule.createNestApplication();
    await mockApp.init();
    mockAppServer = mockApp.getHttpServer();
  });

  describe('latest shoutouts', function () {
    it(`should return ${LATEST_SHOUTOUTS_LIMIT} shoutouts and exclude the oldest one given that more than ${LATEST_SHOUTOUTS_LIMIT + 1} exist`, async function () {
      const shoutoutUuid = getShoutoutTestUuid();

      await mockService.insertSingleRecipientShoutout({
        uuid: shoutoutUuid,
        text: 'oldest shoutout',
      });

      //insert our own shoutouts in case database has less than we need
      for (let i = 0; i < LATEST_SHOUTOUTS_LIMIT; i++) {
        await mockService.insertSingleRecipientShoutout({
          uuid: shoutoutUuid,
          text: 'newest shoutouts',
        });
      }

      const response = await request(mockAppServer).get('/shoutouts/latest');
      const results = response.body;
      const oldestShoutout = results.find((result) => result.text.includes('oldest shoutout'));

      expect(response.status).toBe(200);
      expect(results.length).toBe(LATEST_SHOUTOUTS_LIMIT);
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

    beforeAll(async function () {
      const mockShoutout = mockService.getBaseShoutout();

      const mockByYearShoutout = {
        ...mockShoutout,
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

      await mockService.insertSingleRecipientShoutout(mockShoutoutsPastTwelveMonths[0]);
      await mockService.insertSingleRecipientShoutout(mockShoutoutsPastTwelveMonths[1]);

      //2021
      await mockService.insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('2021-06-25'),
      });

      //2020
      await mockService.insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('2020-07-27'),
      });

      await mockService.insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('2020-12-31'),
      });

      //1991
      await mockService.insertSingleRecipientShoutout({
        ...mockByYearShoutout,
        createDate: new Date('1991-03-23'),
      });
    });

    it('should return only shoutouts for the given year', async function () {
      const year = 2020;
      const response = await request(mockAppServer).get(`/shoutouts/by-year?year=${year}`);
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
      const response = await request(mockAppServer).get('/shoutouts/by-year');
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);
      const shoutoutsInPastTwelveMonths = testShoutouts.filter(getShoutoutsWithinTwelveMonths);

      expect(response.status).toBe(200);
      expect(testShoutouts.length).toBe(mockShoutoutsPastTwelveMonths.length);
      expect(shoutoutsInPastTwelveMonths.length).toBe(mockShoutoutsPastTwelveMonths.length);
    });

    it('should not return any shoutouts when given year has none', async function () {
      const year = '2002';
      const response = await request(mockAppServer).get(`/shoutouts/by-year?year=${year}`);
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);

      expect(response.status).toBe(200);
      expect(testShoutouts.length).toBe(0);
    });

    it('should return all shoutouts from the past 12 months by default when invalid (non-number) year is given', async function () {
      const year = '200X';
      const response = await request(mockAppServer).get(`/shoutouts/by-year?year=${year}`);
      const results = response.body;
      const testShoutouts = getTestShoutouts(results);
      const shoutoutsInPastTwelveMonths = testShoutouts.filter(getShoutoutsWithinTwelveMonths);

      expect(response.status).toBe(200);
      expect(shoutoutsInPastTwelveMonths.length).toBe(mockShoutoutsPastTwelveMonths.length);
    });
  });

  afterAll(async function () {
    await mockService.closeDatabase();
    await mockApp.close();
  });
});
