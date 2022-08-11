import { Inject, Injectable } from '@nestjs/common';
import { MESSAGE_REPOSITORY, PERSON_REPOSITORY } from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class HelperService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(MESSAGE_REPOSITORY) private messageRepository: Repository<Message>,
  ) {}

  /**
   * Maps fields from Person entity for each shoutout's author based on id, as well as retrieves each shoutout's
   * elements (items that comprise the actual shououtout e.g. its text and any slack users that were @'d)
   * @param personId specific author to join shoutouts on (if not passed in, each shoutout just joins to its author)
   */
  getShoutouts(personId?: string): SelectQueryBuilder<Message> {
    const id = personId ? "'" + personId + "'" : 'person."employeeId"';

    return this.messageRepository
      .createQueryBuilder('shoutout')
      .innerJoinAndMapOne('shoutout.author', Person, 'person', `shoutout."authorId" = ${id}`)
      .innerJoinAndSelect('shoutout.elements', 'elements');
  }

  /**
   * Maps each shoutout's array of recipient ids into actual Person entity fields,
   * as well as sorts each shoutout's elements to ensure correct order of words in shoutout
   * @param shoutouts list of shoutouts, each with array of recipient ids
   */
  async postProcessShoutouts(shoutouts) {
    for (const message of shoutouts) {
      message.elements = message.elements.sort((a, b) => a.id - b.id);

      message.recipients = await Promise.all(
        message.recipients.map(async (recipientId): Promise<Person> => {
          return this.personRepository.findOne({ where: { employeeId: recipientId }});
        }),
      );
    }
  }
}
