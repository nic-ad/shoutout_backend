import { Message } from 'src/database/modules/message/message.entity';
import { Person } from 'src/database/modules/person/person.entity';

export type MockProfile = Omit<Person, 'id'>;
export type MockProfiles = Omit<Person[], 'id'>;
export type MockMessage = Omit<Message, 'id' | 'channel'>;

export interface ApiMocks {
  basePerson: Omit<Person, 'id' | 'name' | 'email' | 'employeeId'>;
  mockPerson1: Person;
  mockPerson2: Person;
  mockPerson3: Person;
  singleRecipientShoutout: MockMessage;
  multiRecipientShoutout: MockMessage;
}
