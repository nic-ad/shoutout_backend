import { INestApplication } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DEFAULT_JWT } from 'src/modules/auth/constants';
import { channelProviders } from 'src/modules/database/channel/channel.providers';
import { DATA_SOURCE } from 'src/modules/database/constants';
import { DatabaseModule } from 'src/modules/database/database.module';
import { getInitializedDataSource } from 'src/modules/database/database.providers';
import { messageProviders } from 'src/modules/database/message/message.providers';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SlackService } from 'src/slack/slack.service';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { MockService } from '../test/mock.service';

export async function initTestingModule(moduleBeingTested: any): Promise<any> {
  const mockModule: TestingModule = await Test.createTestingModule({
    imports: [DatabaseModule, AuthModule, moduleBeingTested],
    providers: [...personProviders, ...messageProviders, ...channelProviders, MockService],
  })
    .overrideProvider(DATA_SOURCE)
    .useFactory({
      factory: async (): Promise<DataSource> => {
        return getInitializedDataSource(
          process.env.POSTGRES_TEST_DB,
          process.env.POSTGRES_TEST_PORT,
        );
      },
    })
    .overrideGuard(AuthGuard(DEFAULT_JWT))
    .useValue({ canActivate: () => true })
    .overrideProvider(SlackService)
    .useValue({})
    .compile();

  const mockService: MockService = await mockModule.resolve(MockService);
  const mockApp: INestApplication = mockModule.createNestApplication();

  await mockApp.init();

  const mockAppServer: any = mockApp.getHttpServer();

  return {
    service: mockService,
    app: mockApp,
    appServer: mockAppServer,
  };
}

/**
 * Returns a fresh identifier used in the shoutout text for tests so that no matter the users involved in the shoutouts or what is in the
 * database at the time of test runs, we have a unique key to look for so that we can filter on / care about only those shoutouts for test assertions
 */
export function getShoutoutTestUuid() {
  return uuidv4();
}
