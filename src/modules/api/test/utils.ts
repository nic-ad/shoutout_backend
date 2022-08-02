import { Test, TestingModule } from '@nestjs/testing';
import { personProviders } from 'src/modules/database/person/person.providers';
import { DatabaseModule } from 'src/modules/database/database.module';
import { MockService } from '../test/mock.service';
import { INestApplication } from '@nestjs/common';
import { ApiMocks } from './types';
import { MANY_PROFILES_LIMIT } from '../constants';
import { Person } from 'src/modules/database/person/person.entity';
import { Message } from 'src/modules/database/message/message.entity';
import { messageProviders } from 'src/modules/database/message/message.providers';
import { v4 as uuidv4 } from 'uuid';
import { channelProviders } from 'src/modules/database/channel/channel.providers';

let mockService: MockService;

export async function initTests(moduleBeingTested): Promise<any> {
  const mockModule: TestingModule = await Test.createTestingModule({
    imports: [DatabaseModule, moduleBeingTested],
    providers: [...personProviders, ...messageProviders, ...channelProviders, MockService],
  }).compile();

  mockService = mockModule.get<MockService>(MockService);
  const data: ApiMocks = await mockService.setupData();

  const app: INestApplication = mockModule.createNestApplication();
  await app.init();

  return { mockService, data, app };
}

export async function mockCommonProfileNeedsInsert(): Promise<boolean> {
  const count = await mockService.getMockCommonProfileCount();
  return count < MANY_PROFILES_LIMIT;
}

export function insertCommonProfiles(commonPersonProfiles: Person[]): Promise<Person[]> {
  return mockService.insertCommonProfiles(commonPersonProfiles);
}

/**
 * Returns a fresh identifier used in the shoutout text for tests so that no matter the users involved in the shoutouts or what is in the
 * database at the time of test runs, we have a unique key to look for so that we can filter on / care about only those shoutouts for test assertions
 */
export function getShoutoutTestUuid() {
  return uuidv4();
}

export function insertSingleRecipientShoutout(shoutout: any): Promise<Message> {
  return mockService.insertSingleRecipientShoutout({
    text: `${shoutout.text || 'single shoutout'} ${shoutout.uuid}`,
    createDate: shoutout.createDate,
  });
}

export function insertMultiRecipientShoutout(shoutoutUuid: number): Promise<Message> {
  return mockService.insertMultiRecipientShoutout(`multi shoutout ${shoutoutUuid}`);
}

export function closeDatabase(): Promise<void> {
  return mockService.closeDatabase();
}
