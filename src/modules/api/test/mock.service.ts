import { Inject, Injectable } from '@nestjs/common';
import {
  CHANNEL_REPOSITORY,
  MESSAGE_REPOSITORY,
  PERSON_REPOSITORY,
} from 'src/database/constants';
import { Message } from 'src/database/modules/message/message.entity';
import { Person } from 'src/database/modules/person/person.entity';
import { Repository } from 'typeorm';
import { MOCK_COMMON_PERSON_NAME } from '../constants';
import { ApiMocks, MockMessage, MockProfiles, MockProfile } from './types';
import { Channel } from 'src/database/modules/channel/channel.entity';

@Injectable()
export class MockService {
  basePerson = {
    image72: '',
    image192: '',
    image512: '',
    country: '',
    team: '',
    shoutoutsGiven: [],
    shoutoutsReceived: [],
  };

  private baseShoutout: MockMessage = {
    text: '',
    createDate: null,
    recipients: [],
    authorId: '',
    elements: [],
  };

  //omit ids as they is uuid generated on table insert

  private person1: MockProfile;
  private person2: MockProfile;
  private person3: MockProfile;

  private singleRecipientShoutout: MockMessage = { ...this.baseShoutout };
  private multiRecipientShoutout: MockMessage = { ...this.baseShoutout };

  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(MESSAGE_REPOSITORY) private messageRepository: Repository<Message>,
    @Inject(CHANNEL_REPOSITORY) private channelRepository: Repository<Channel>,
  ) {
    this.person1 = {
      ...this.basePerson,
      email: 'shoutout.test.one@deptagency.com',
      employeeId: 'XX1',
      name: 'Shoutout Test-One',
    };

    this.person2 = {
      ...this.basePerson,
      email: 'shoutout.test.two@deptagency.com',
      employeeId: 'XX2',
      name: 'Shoutout Mock-Two',
    };

    this.person3 = {
      ...this.basePerson,
      email: 'shoutout.test.three@deptagency.com',
      employeeId: 'XX3',
      name: 'Shoutout Test-Three',
    };
  }

  private async mockPerson(person): Promise<Person> {
    let mockPerson = await this.personRepository.findOneBy({
      employeeId: person.employeeId,
    });

    //only insert if not in table already
    if (!mockPerson) {
      mockPerson = await this.personRepository.save(person);
    }

    return mockPerson;
  }

  async setupData(): Promise<ApiMocks> {
    const mockPerson1 = await this.mockPerson(this.person1);
    const mockPerson2 = await this.mockPerson(this.person2);
    const mockPerson3 = await this.mockPerson(this.person3);

    this.singleRecipientShoutout.authorId = mockPerson1.id;
    this.singleRecipientShoutout.recipients = [mockPerson2.id];

    this.multiRecipientShoutout.authorId = mockPerson3.id;
    this.multiRecipientShoutout.recipients = [mockPerson1.id, mockPerson2.id];

    return {
      mockPerson1,
      mockPerson2,
      mockPerson3,
      basePerson: this.basePerson,
      singleRecipientShoutout: this.singleRecipientShoutout,
      multiRecipientShoutout: this.multiRecipientShoutout,
    };
  }

  async getMockCommonProfileCount(): Promise<number> {
    return this.personRepository.count({
      where: { name: MOCK_COMMON_PERSON_NAME },
    });
  }

  async insertCommonProfile(
    commonPersonProfiles: MockProfiles,
  ): Promise<Person[]> {
    return this.personRepository.save(commonPersonProfiles);
  }

  async insertSingleRecipientShoutout(shoutoutUuid: number): Promise<Message> {
    const channel = await this.channelRepository.save({
      name: '',
      slackId: '',
    });

    return await this.messageRepository.query(
      `INSERT INTO message (text, "createDate", "authorId", "channelId", recipients) 
        VALUES ($1, CURRENT_TIMESTAMP, $2, $3, 
        ARRAY [$4]::text[])`,
      [
        `single shoutout ${shoutoutUuid}`,
        this.singleRecipientShoutout.authorId,
        channel.id,
        ...this.singleRecipientShoutout.recipients,
      ],
    );
  }

  async insertMultiRecipientShoutout(shoutoutUuid: number): Promise<Message> {
    return await this.messageRepository.save({
      ...this.multiRecipientShoutout,
      text: `multi shoutout ${shoutoutUuid}`,
    });
  }
}
