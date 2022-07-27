import { Test, TestingModule } from '@nestjs/testing';
import { personProviders } from 'src/database/modules/person/person.providers';
import { DatabaseModule } from 'src/database/database.module';
import { MockService } from '../test/mock.service';
import { INestApplication } from '@nestjs/common';
import { ApiMocks, MockProfiles } from './types';
import { MANY_PROFILES_LIMIT } from '../constants';
import { Person } from 'src/database/modules/person/person.entity';
import { Message } from 'src/database/modules/message/message.entity';
import { messageProviders } from 'src/database/modules/message/message.providers';
import { v4 as uuidv4 } from 'uuid';
import { channelProviders } from 'src/database/modules/channel/channel.providers';

let mockService: MockService;

export async function initTests(moduleBeingTested): Promise<any> {
  const mockModule: TestingModule = await Test.createTestingModule({
    imports: [DatabaseModule, moduleBeingTested],
    providers: [
      ...personProviders,
      ...messageProviders,
      ...channelProviders,
      MockService,
    ],
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

export function insertCommonProfile(
  commonPersonProfiles: MockProfiles,
): Promise<Person[]> {
  return mockService.insertCommonProfile(commonPersonProfiles);
}

//******
//returns fresh identifier used in the shoutout text for tests so that no matter the users involved in the shoutouts or what is in the
//database at the time of test runs, we have a unique key to look for so that we can filter on / care about only those shoutouts for test assertions
//******
export function getShoutoutTestUuid() {
  return uuidv4();
}

export function insertSingleRecipientShoutout(
  shoutoutUuid: number,
): Promise<Message> {
  return mockService.insertSingleRecipientShoutout(shoutoutUuid);
}

export function insertMultiRecipientShoutout(
  shoutoutUuid: number,
): Promise<Message> {
  return mockService.insertMultiRecipientShoutout(shoutoutUuid);
}
