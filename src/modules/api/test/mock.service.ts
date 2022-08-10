import { Inject, Injectable } from '@nestjs/common';
import {
  CHANNEL_REPOSITORY,
  DATA_SOURCE,
  MESSAGE_REPOSITORY,
  PERSON_REPOSITORY,
} from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { Repository } from 'typeorm';
import { MOCK_COMMON_PERSON_NAME, MOCK_SHOUTOUT_TEXT } from './constants';
import { ApiMocks, MockMessage } from './types';
import { Channel } from 'src/modules/database/channel/channel.entity';
import { DataSource } from 'typeorm';

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

    this.singleRecipientShoutout.authorId = mockPerson1.employeeId;
    this.singleRecipientShoutout.recipients = [mockPerson2.employeeId];

    this.multiRecipientShoutout.authorId = mockPerson3.employeeId;
    this.multiRecipientShoutout.recipients = [mockPerson1.employeeId, mockPerson2.employeeId];

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

  async insertCommonProfiles(commonPersonProfiles: Person[]): Promise<Person[]> {
    return this.personRepository.save(commonPersonProfiles);
  }

  private async insertShoutout(shoutout: any): Promise<Message> {
    const channel = await this.channelRepository.save({
      name: '',
      slackId: '',
    });

    const params = [
      `${MOCK_SHOUTOUT_TEXT} ${shoutout.text}`,
      shoutout.createDate || new Date(),
      shoutout.authorId,
      channel.id,
      shoutout.recipients[0],
    ];

    if (shoutout.multiRecipient) {
      params.push(shoutout.recipients[1]);
    }

    return await this.messageRepository.query(
      `INSERT INTO message (text, "createDate", "authorId", "channelId", recipients) 
        VALUES ($1, $2, $3, $4, ARRAY[$5${shoutout.multiRecipient ? ',$6' : ''}])`,
      params,
    );
  }

  async insertSingleRecipientShoutout(shoutout: any): Promise<Message> {
    return this.insertShoutout({
      ...shoutout,
      authorId: this.singleRecipientShoutout.authorId,
      recipients: this.singleRecipientShoutout.recipients,
    });
  }

  async insertMultiRecipientShoutout(shoutoutText: string): Promise<Message> {
    return this.insertShoutout({
      text: shoutoutText,
      authorId: this.multiRecipientShoutout.authorId,
      recipients: this.multiRecipientShoutout.recipients,
      multiRecipient: true,
    });
  }

  async closeDatabase(): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .delete()
      .from(Message)
      .where('text LIKE :mockText', { mockText: `${MOCK_SHOUTOUT_TEXT}%` })
      .execute();

    //person repo not cleared here because only a set number of people are mocked, whereas mock messages (shoutouts) accumulate and bog down the table after a while

    return this.dataSource.destroy();
  }
}
