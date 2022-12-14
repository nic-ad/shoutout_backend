import { Person } from 'src/modules/database/person/person.entity';
import * as request from 'supertest';

import { MANY_PROFILES_LIMIT } from '../constants';
import { MOCK_COMMON_PERSON_NAME } from '../test/constants';
import { ApiMocks } from '../test/types';
import { getShoutoutTestUuid, initTestingModule } from '../test/utils';
import { ProfileModule } from './profile.module';

describe('ProfileService', function () {
  let mocks: any;
  let mockData: ApiMocks;

  beforeAll(async function () {
    mocks = await initTestingModule(ProfileModule);
    mockData = await mocks.service.getMockData();
  });

  describe('profile search by name/email', function () {
    it('should find only profiles with name containing the search query', async function () {
      const searchQuery = 'shoutOUT TesT';
      const response = await request(mocks.appServer).get(`/profile/search?name=${searchQuery}`);
      const results = response.body;
      const resultWithoutQueryInName = results.find(
        (profile) => !profile.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      expect(response.status).toBe(200);
      expect(results.length).toBe(2);
      expect(resultWithoutQueryInName).toBeFalsy();
    });

    it('should find only profiles with email containing the search query', async function () {
      const searchQuery = 'test.one';
      const response = await request(mocks.appServer).get(`/profile/search?email=${searchQuery}`);
      const results = response.body;
      const resultWithoutQueryInEmail = results.find(
        (profile) => !profile.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      expect(response.status).toBe(200);
      expect(results.length).toBe(1);
      expect(resultWithoutQueryInEmail).toBeFalsy();
    });

    it('should return correct match for the given full name search', async function () {
      const searchQuery = mockData.person2.name;
      const response = await request(mocks.appServer).get(`/profile/search?name=${searchQuery}`);
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(1);
      expect(results[0].name).toBe(searchQuery);
    });

    it('should return correct match for the given full email search', async function () {
      const searchQuery = mockData.person3.email;
      const response = await request(mocks.appServer).get(`/profile/search?email=${searchQuery}`);
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(1);
      expect(results[0].email).toBe(searchQuery);
    });

    it('should return no results given garbage search query', async function () {
      const response = await request(mocks.appServer).get(
        '/profile/search?name=jkasdjkabsisdhkabkjn',
      );
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(0);
    });

    it(`should have same number of results from name + email search as when each searched
      separately (this tests for no duplicate results)`, async function () {
      const searchQuery = 'shoutout test';

      const togetherResults = await request(mocks.appServer).get(
        `/profile/search?name=${searchQuery}&email=${searchQuery}`,
      );
      const nameResults = await request(mocks.appServer).get(`/profile/search?name=${searchQuery}`);
      const emailResults = await request(mocks.appServer).get(
        `/profile/search?email=${searchQuery}`,
      );

      const namePlusEmailResults = [...nameResults.body, ...emailResults.body];
      const distinctResults = [...new Set(namePlusEmailResults.map((result) => result.employeeId))];

      expect(togetherResults.body.length).toBe(distinctResults.length);
    });
  });

  describe('profile search by common name (that returns many results)', function () {
    beforeAll(async function () {
      const commonPersonProfiles: Person[] = [];

      //insert 1 more than the limit so we can test that only the limit is returned
      const numberOfMocksToInsert = MANY_PROFILES_LIMIT + 1;

      for (let i = 0; i < numberOfMocksToInsert; i++) {
        commonPersonProfiles[i] = {
          ...mockData.basePerson,
          name: MOCK_COMMON_PERSON_NAME,
          //these must be unique
          employeeId: `X${i}`,
          email: `mock.common.${i}@deptagency.com`,
        };
      }

      await mocks.service.insertCommonProfiles(commonPersonProfiles);
    });

    it(`should limit large response to ${MANY_PROFILES_LIMIT} results`, async function () {
      const response = await request(mocks.appServer).get(
        `/profile/search?name=${MOCK_COMMON_PERSON_NAME}`,
      );
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(MANY_PROFILES_LIMIT);
    });
  });

  describe('profile search by id', function () {
    it('should return correct result given valid id', async function () {
      const person = mockData.person1;
      const response = await request(mocks.appServer).get(`/profile/${person.employeeId}`);
      const result = response.body;

      expect(response.status).toBe(200);
      expect(result.employeeId).toBe(person.employeeId);
    });

    it("should 404 given id that doesn't belong to anyone", async function () {
      const response = await request(mocks.appServer).get('/profile/XXXXXTESTXXXXX');
      expect(response.status).toBe(404);
    });
  });

  async function expectShoutoutReceived(shoutoutUuid, recipientId) {
    const response = await request(mocks.appServer).get(`/profile/${recipientId}`);
    const result = response.body;

    //retrieve the 1 shoutout that has the uuid of this test run
    const testShoutoutsReceived = result.shoutoutsReceived.filter((shoutout) =>
      shoutout.text.includes(shoutoutUuid.toString()),
    );

    const recipientIds = testShoutoutsReceived[0].recipients.map(
      (recipient) => recipient.employeeId,
    );

    expect(response.status).toBe(200);
    expect(testShoutoutsReceived.length).toBe(1);
    expect(recipientIds).toContain(recipientId);
  }

  describe('single-recipient shoutout on user profiles', function () {
    const shoutoutUuid = getShoutoutTestUuid();

    beforeAll(async function () {
      await mocks.service.insertSingleRecipientShoutout({ uuid: shoutoutUuid });
    });

    it('author profile should have shoutout given with self as author', async function () {
      const response = await request(mocks.appServer).get(
        `/profile/${mockData.singleRecipientShoutout.authorId}`,
      );
      const result = response.body;

      const testShoutoutsGiven = result.shoutoutsGiven.filter((shoutout) =>
        shoutout.text.includes(shoutoutUuid.toString()),
      );

      expect(response.status).toBe(200);
      expect(testShoutoutsGiven.length).toBe(1);
      expect(testShoutoutsGiven[0].author.employeeId).toBe(
        mockData.singleRecipientShoutout.authorId,
      );
    });

    it('recipient profile should have shoutout received with self as recipient', async function () {
      const recipientId = mockData.singleRecipientShoutout.recipients[0];
      await expectShoutoutReceived(shoutoutUuid, recipientId);
    });
  });

  describe('multi-recipient shoutout on user profiles', function () {
    const shoutoutUuid = getShoutoutTestUuid();

    beforeAll(async function () {
      await mocks.service.insertMultiRecipientShoutout(shoutoutUuid);
    });

    it('recipient profiles should each have shoutout received with self as recipient', async function () {
      const recipient1Id = mockData.multiRecipientShoutout.recipients[0];
      const recipient2Id = mockData.multiRecipientShoutout.recipients[1];

      await expectShoutoutReceived(shoutoutUuid, recipient1Id);
      await expectShoutoutReceived(shoutoutUuid, recipient2Id);
    });
  });

  afterAll(async function () {
    await mocks.service.closeDatabase();
    await mocks.app.close();
  });
});
