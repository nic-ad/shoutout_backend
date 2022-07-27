import { ShoutoutsModule } from './shoutouts.module';
import * as request from 'supertest';
import { initTests } from '../test/utils';

describe('ShoutoutsService', () => {
  let mocks: any;

  beforeAll(async () => (mocks = await initTests(ShoutoutsModule)));

  describe('latest shoutouts', function () {});

  afterAll(async () => {
    await mocks.app.close();
  });
});
