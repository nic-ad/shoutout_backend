import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';

//omit id as it is uuid generated on table insert
export type MockMessage = Omit<Message, 'id' | 'elements'> & { elements: any };
export interface ApiMocks {
  basePerson: Omit<Person, 'name' | 'email' | 'employeeId'>; //omit the properties that must be unique
  mockPerson1: Person;
  mockPerson2: Person;
  mockPerson3: Person;
  singleRecipientShoutout: MockMessage;
  multiRecipientShoutout: MockMessage;
}
