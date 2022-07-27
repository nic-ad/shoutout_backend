import { ProfileModule } from './profile.module';
import * as request from 'supertest';
import {
  initTests,
  mockCommonProfileNeedsInsert,
  insertCommonProfile,
  insertSingleRecipientShoutout,
  getShoutoutTestUuid,
} from '../test/utils';
import { MANY_PROFILES_LIMIT, MOCK_COMMON_PERSON_NAME } from '../constants';
import { MockProfiles } from '../test/types';
import { NIL as NIL_UUID } from 'uuid';

describe('ProfileService', () => {
  let mocks: any;
  let testServer: any;

  beforeAll(async () => {
    mocks = await initTests(ProfileModule);
    testServer = mocks.app.getHttpServer();
  });

  describe('profile search by name/email', function () {
    it('should find only profiles whose name contains the search query', async () => {
      const searchQuery = 'TesT';
      const response = await request(testServer).get(
        `/profile/search?name=${searchQuery}`,
      );
      const results = response.body;
      const resultWithoutQueryInName = results.find(
        (profile) =>
          !profile.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      expect(response.status).toBe(200);
      expect(results.length).toBeGreaterThan(0);
      expect(resultWithoutQueryInName).toBeFalsy();
    });

    it('should find only profiles whose email contains the search query', async () => {
      const searchQuery = 'one';
      const response = await request(testServer).get(
        `/profile/search?email=${searchQuery}`,
      );
      const results = response.body;
      const resultWithoutQueryInEmail = results.find(
        (profile) =>
          !profile.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      expect(response.status).toBe(200);
      expect(results.length).toBeGreaterThan(0);
      expect(resultWithoutQueryInEmail).toBeFalsy();
    });

    it('should return correct match for the given full name search', async function () {
      const searchQuery = mocks.data.mockPerson2.name;
      const response = await request(testServer).get(
        `/profile/search?name=${searchQuery}`,
      );
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(1);
      expect(results[0].name).toBe(searchQuery);
    });

    it('should return correct match for the given full email search', async function () {
      const searchQuery = mocks.data.mockPerson3.email;
      const response = await request(testServer).get(
        `/profile/search?email=${searchQuery}`,
      );
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(1);
      expect(results[0].email).toBe(searchQuery);
    });

    it('should return no results given garbage search query', async function () {
      const response = await request(testServer).get(
        '/profile/search?name=jkasdjkabsisdhkabkjn',
      );
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(0);
    });

    it('should have same number of results from name + email search as when each searched separately (testing for no duplicates)', async function () {
      const searchQuery = 'test';

      const togetherResults = await request(testServer).get(
        `/profile/search?name=${searchQuery}&email=${searchQuery}`,
      );
      const nameResults = await request(testServer).get(
        `/profile/search?name=${searchQuery}`,
      );
      const emailResults = await request(testServer).get(
        `/profile/search?email=${searchQuery}`,
      );

      const namePlusEmailResults = [...nameResults.body, ...emailResults.body];
      const distinctResults = [
        ...new Set(namePlusEmailResults.map((result) => result.id)),
      ];

      expect(togetherResults.body.length).toBe(distinctResults.length);
    });
  });

  describe('profile search by common name (to return many results)', function () {
    beforeAll(async () => {
      let commonPersonProfiles: MockProfiles = [];

      if (await mockCommonProfileNeedsInsert()) {
        //insert 1 more than the limit so we can test that only the limit is returned
        const numberOfMocksToInsert = MANY_PROFILES_LIMIT + 1;

        for (let i = 0; i < numberOfMocksToInsert; i++) {
          commonPersonProfiles[i] = {
            ...mocks.data.basePerson,
            name: MOCK_COMMON_PERSON_NAME,
            //these must be unique
            employeeId: `X${i}`,
            email: `mock.common.${i}@deptagency.com`,
          };
        }

        await insertCommonProfile(commonPersonProfiles);
      }
    });

    it(`should limit large response to ${MANY_PROFILES_LIMIT} results`, async function () {
      const response = await request(testServer).get(
        `/profile/search?name=${MOCK_COMMON_PERSON_NAME}`,
      );
      const results = response.body;

      expect(response.status).toBe(200);
      expect(results.length).toBe(MANY_PROFILES_LIMIT);
    });
  });

  describe('profile search by id', function () {
    it('should return correct result given valid id', async function () {
      const mockPerson = mocks.data.mockPerson1;
      const response = await request(testServer).get(
        `/profile/${mockPerson.id}`,
      );
      const result = response.body;

      expect(response.status).toBe(200);
      expect(result.name).toBe(mockPerson.name);
    });

    it("should 404 given id that is in valid format but that doesn't belong to anyone", async function () {
      const response = await request(testServer).get(`/profile/${NIL_UUID}`);
      expect(response.status).toBe(404);
    });

    it('should return 404 given id in invalid format', async function () {
      const response = await request(testServer).get('/profile/9');
      expect(response.status).toBe(404);
    });
  });

  async function expectShoutoutReceived(shoutoutUuid, recipientId) {
    const response = await request(testServer).get(`/profile/${recipientId}`);
    const result = response.body;

    //should find 1 shoutout because only one has the timestamp of this test run
    const testShoutoutsReceived = result.shoutoutsReceived.filter((shoutout) =>
      shoutout.text.includes(shoutoutUuid.toString()),
    );

    expect(response.status).toBe(200);
    expect(testShoutoutsReceived.length).toBe(1);
    expect(testShoutoutsReceived[0].recipients[0].id).toBe(recipientId);
  }

  describe('single-recipient shoutout on user profiles', function () {
    const shoutoutUuid = getShoutoutTestUuid();

    beforeAll(async () => await insertSingleRecipientShoutout(shoutoutUuid));

    it('author profile should have shoutout given with self as author', async function () {
      const response = await request(testServer).get(
        `/profile/${mocks.data.singleRecipientShoutout.authorId}`,
      );
      const result = response.body;
      console.log(result); //////////////////////
      const testShoutoutsGiven = result.shoutoutsGiven.filter((shoutout) =>
        shoutout.text.includes(shoutoutUuid.toString()),
      );

      expect(response.status).toBe(200);
      expect(testShoutoutsGiven.length).toBe(1);
      expect(testShoutoutsGiven[0].author.id).toBe(
        mocks.data.singleRecipientShoutout.authorId,
      );
    });

    it('recipient profile should have shoutout received with self as recipient', async function () {
      const recipientId = mocks.data.singleRecipientShoutout.recipients[0];
      await expectShoutoutReceived(shoutoutUuid, recipientId);
    });
  });

  afterAll(async () => {
    await mocks.app.close();
  });
});
