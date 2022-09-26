import { Inject, Injectable } from '@nestjs/common';
import { Channel } from 'src/modules/database/channel/channel.entity';
import {
  CHANNEL_REPOSITORY,
  DATA_SOURCE,
  MESSAGE_REPOSITORY,
  PERSON_REPOSITORY,
} from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { DataSource, Repository } from 'typeorm';

import { MOCK_PERSON_NAME, MOCK_SHOUTOUT_TEXT } from './constants';
import { ApiMocks, MockMessage } from './types';

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

    //stub these out until test logic for these fields is written
    elements: [{ text: '', type: '', employeeId: '' }],
    channel: null,
  };

  private person1: Person;
  private person2: Person;
  private person3: Person;

  private singleRecipientShoutout: MockMessage = { ...this.baseShoutout };
  private multiRecipientShoutout: MockMessage = { ...this.baseShoutout };

  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(MESSAGE_REPOSITORY) private messageRepository: Repository<Message>,
    @Inject(CHANNEL_REPOSITORY) private channelRepository: Repository<Channel>,
    @Inject(DATA_SOURCE) private dataSource: DataSource,
  ) {
    this.person1 = {
      ...this.basePerson,
      email: 'shoutout.test.one@deptagency.com',
      employeeId: 'XX1',
      name: `${MOCK_PERSON_NAME} Test-One`,
    };

    this.person2 = {
      ...this.basePerson,
      email: 'shoutout.test.two@deptagency.com',
      employeeId: 'XX2',
      name: `${MOCK_PERSON_NAME} Mock-Two`,
    };

    this.person3 = {
      ...this.basePerson,
      email: 'shoutout.test.three@deptagency.com',
      employeeId: 'XX3',
      name: `${MOCK_PERSON_NAME} Test-Three`,
    };

    this.singleRecipientShoutout.authorId = this.person1.employeeId;
    this.singleRecipientShoutout.recipients = [this.person2.employeeId];

    this.multiRecipientShoutout.authorId = this.person3.employeeId;
    this.multiRecipientShoutout.recipients = [this.person1.employeeId, this.person2.employeeId];
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

  async getMockData(): Promise<ApiMocks> {
    const person1 = await this.mockPerson(this.person1);
    const person2 = await this.mockPerson(this.person2);
    const person3 = await this.mockPerson(this.person3);

    return {
      basePerson: this.basePerson,
      person1,
      person2,
      person3,
      singleRecipientShoutout: this.singleRecipientShoutout,
      multiRecipientShoutout: this.multiRecipientShoutout,
    };
  }

  async insertCommonProfiles(commonPersonProfiles: Person[]): Promise<Person[]> {
    return this.personRepository.save(commonPersonProfiles);
  }

  private async insertShoutout(shoutout: any): Promise<Message> {
    const channel = await this.channelRepository.save({
      name: '',
      slackId: '',
    });

    const recipients: string[] = [shoutout.recipients[0]];

    if (shoutout.multiRecipient) {
      recipients.push(shoutout.recipients[1]);
    }

    const mockMessage = await this.messageRepository.create({
      authorId: shoutout.authorId,
      channel,
      elements: this.baseShoutout.elements,
      recipients,
      text: `${MOCK_SHOUTOUT_TEXT} ${shoutout.text}`,
      createDate: shoutout.createDate || new Date(),
    });

    return this.messageRepository.save(mockMessage);
  }

  async insertSingleRecipientShoutout(shoutout: any): Promise<Message> {
    return this.insertShoutout({
      text: `${shoutout.text || 'single shoutout'} ${shoutout.uuid}`,
      createDate: shoutout.createDate,
      authorId: this.singleRecipientShoutout.authorId,
      recipients: this.singleRecipientShoutout.recipients,
    });
  }

  async insertMultiRecipientShoutout(shoutoutUuid: string): Promise<Message> {
    return this.insertShoutout({
      text: `multi shoutout ${shoutoutUuid}`,
      authorId: this.multiRecipientShoutout.authorId,
      recipients: this.multiRecipientShoutout.recipients,
      multiRecipient: true,
    });
  }

  getBaseShoutout(): MockMessage {
    return this.baseShoutout;
  }

  async closeDatabase(): Promise<void> {
    return this.dataSource.destroy();
  }
}
