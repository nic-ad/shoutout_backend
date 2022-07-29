import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';

//omit ids as they are uuids generated on table insert

export type MockMessage = Omit<Message, 'id' | 'channel'>;
export interface ApiMocks {
  basePerson: Omit<Person, 'name' | 'email' | 'employeeId'>;
  mockPerson1: Person;
  mockPerson2: Person;
  mockPerson3: Person;
  singleRecipientShoutout: MockMessage;
  multiRecipientShoutout: MockMessage;
}
