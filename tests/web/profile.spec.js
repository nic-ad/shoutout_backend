const request = require('supertest');
const app = require('../../web');
const { Message, Person } = require('../../models');
const { manyProfilesLimit } = require('../../utils/constants');
const {
  singleRecipientShoutout,
  multiRecipientShoutout,
  getShoutoutTestTimestamp,
  person2,
} = require('./mocks');
const setupData = require('../setup');

beforeAll(() => {
  return setupData('test-profile');
});

describe('profile search by name/email', function () {
  it('should find only profiles whose name contains the search query', async function () {
    const searchQuery = 'TesT';
    const response = await request(app).get(
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

  it('should find only profiles whose email contains the search query', async function () {
    const searchQuery = 'booMi';
    const response = await request(app).get(
      `/profile/search?email=${searchQuery}`,
    );
    const results = response.body;
    const resultWithoutQueryInEmail = results.find(
      (profile) => !profile.email.includes(searchQuery.toLowerCase()),
    );

    expect(response.status).toBe(200);
    expect(results.length).toBeGreaterThan(0);
    expect(resultWithoutQueryInEmail).toBeFalsy();
  });

  it('should return correct match for the given full name search', async function () {
    const searchQuery = person2.name;
    const response = await request(app).get(
      `/profile/search?name=${searchQuery}`,
    );
    const results = response.body;

    expect(response.status).toBe(200);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe(searchQuery);
  });

  it('should return correct match for the given full email search', async function () {
    const searchQuery = person2.email;
    const response = await request(app).get(
      `/profile/search?email=${searchQuery}`,
    );
    const results = response.body;

    expect(response.status).toBe(200);
    expect(results.length).toBe(1);
    expect(results[0].email).toBe(searchQuery);
  });

  it('should return no results given garbage search query', async function () {
    const response = await request(app).get(
      '/profile/search?name=alakjdsnlasnljkanlksnadlnaksnda',
    );
    const results = response.body;

    expect(response.status).toBe(200);
    expect(results.length).toBe(0);
  });

  it('should have same number of results from name + email search as when each searched separately', async function () {
    const searchQuery = 'test';

    const togetherResults = await request(app).get(
      `/profile/search?name=${searchQuery}&email=${searchQuery}`,
    );

    const nameResults = await request(app).get(
      `/profile/search?name=${searchQuery}`,
    );
    const emailResults = await request(app).get(
      `/profile/search?email=${searchQuery}`,
    );

    const namePlusEmailResults = [...nameResults.body, ...emailResults.body];
    const distinctResults = [
      ...new Set(namePlusEmailResults.map((result) => result._id)),
    ];

    expect(togetherResults.body.length).toBe(distinctResults.length);
  });

  it('should return 500 given invalid search', async function () {
    const response = await request(app).get('/profile/search?name=?');
    expect(response.status).toBe(500);
  });
});

describe('profile search by common name (to return many results)', function () {
  const name = 'Mock Shoutout Repeated Person';

  const mockPerson = {
    country: 'US',
    name,
    team: null,
  };

  beforeAll(() => {
    return async function () {
      let mockManyProfiles = [];

      const count = await Person.countDocuments({ name: mockPerson.name });

      if (count < manyProfilesLimit) {
        //insert 1 more than the limit so we can test that only the limit is returned
        const numberOfMocksToInsert = manyProfilesLimit + 1;

        for (let i = 0; i < numberOfMocksToInsert; i++) {
          //employeeId and email must be unique
          mockManyProfiles[i] = {
            ...mockPerson,
            employeeId: Date.now() + i,
            email: `mock.repeated.${i}@deptagency.com`,
          };
        }

        await Person.insertMany(mockManyProfiles);
      }
    };
  });

  it(`should limit large response to ${manyProfilesLimit} results`, async function () {
    const response = await request(app).get(`/profile/search?name=${name}`);
    const results = response.body;

    expect(response.status).toBe(200);
    expect(results.length).toBe(manyProfilesLimit);
  });
});

describe('profile search by id', function () {
  it('should return correct result given valid id', async function () {
    const response = await request(app).get(`/profile/${person2._id}`);
    const result = response.body;

    expect(response.status).toBe(200);
    expect(result.userInfo.name).toBe(person2.name);
  });

  it("should 404 given id that is in valid format but that doesn't belong to anyone", async function () {
    const searchId = '999999999999999999999999';
    const response = await request(app).get(`/profile/${searchId}`);

    expect(response.status).toBe(404);
  });

  it('should return 400 given id in invalid format', async function () {
    const searchId = '9';
    const response = await request(app).get(`/profile/${searchId}`);

    expect(response.status).toBe(400);
  });
});

async function expectShoutoutReceived(shoutoutTimestamp, recipientId) {
  const response = await request(app).get(`/profile/${recipientId}`);
  const result = response.body;

  //should find a single shoutout because only one has the timestamp of this test run
  const testShoutoutsReceived = result.shoutoutsReceived.filter((shoutout) =>
    shoutout.text.includes(shoutoutTimestamp),
  );

  expect(response.status).toBe(200);
  expect(testShoutoutsReceived.length).toBe(1);
  expect(testShoutoutsReceived[0].recipients[0]._id).toBe(recipientId);
}

describe('single-recipient shoutout on user profiles', function () {
  const shoutoutTimestamp = getShoutoutTestTimestamp();

  beforeAll(() => {
    return async function () {
      await Message.create({
        ...singleRecipientShoutout,
        text: `single shoutout ${shoutoutTimestamp}`,
      });
    };
  });

  it('author profile should have shoutout given with self as author', async function () {
    const response = await request(app).get(
      `/profile/${singleRecipientShoutout.authorId}`,
    );
    const result = response.body;
    const testShoutoutsGiven = result.shoutoutsGiven.filter((shoutout) =>
      shoutout.text.includes(shoutoutTimestamp),
    );

    expect(response.status).toBe(200);
    expect(testShoutoutsGiven.length).toBe(1);
    expect(testShoutoutsGiven[0].author._id).toBe(
      singleRecipientShoutout.authorId,
    );
  });

  it('recipient profile should have shoutout received with self as recipient', async function () {
    const recipientId = singleRecipientShoutout.recipientIds[0];
    await expectShoutoutReceived(shoutoutTimestamp, recipientId);
  });
});

describe('multi-recipient shoutout on user profiles', function () {
  const shoutoutTimestamp = getShoutoutTestTimestamp();

  beforeAll(() => {
    return async function () {
      await Message.create({
        ...multiRecipientShoutout,
        text: `multi shoutout ${shoutoutTimestamp}`,
      });
    };
  });

  it('recipient profiles should each have shoutout received with self as recipient', async function () {
    const recipientId1 = multiRecipientShoutout.recipientIds[0];
    const recipientId2 = multiRecipientShoutout.recipientIds[1];

    await expectShoutoutReceived(shoutoutTimestamp, recipientId1);
    await expectShoutoutReceived(shoutoutTimestamp, recipientId2);
  });
});
