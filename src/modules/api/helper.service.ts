import { Inject, Injectable } from '@nestjs/common';
import {
  MESSAGE_REPOSITORY,
  PERSON_REPOSITORY,
} from 'src/modules/database/constants';
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
   * Maps fields from Person entity for each shoutout's author based on id
   * @param personId specific author to join shoutouts on (if none, each shoutout just joins to its author)
   */
  getShoutoutsWithAuthor(personId?: string): SelectQueryBuilder<Message> {
    const id = personId ? "'" + personId + "'" : 'person.id';

    return this.messageRepository
      .createQueryBuilder('shoutout')
      .innerJoinAndMapOne(
        'shoutout.author',
        Person,
        'person',
        `shoutout."authorId"::uuid = ${id}`,
      );
  }

  /**
   * Maps each shoutout's array of recipient ids into actual Person entity fields
   * @param shoutouts list of shoutouts, each with array of recipient ids
   */
  async mapRecipients(shoutouts) {
    for (const message of shoutouts) {
      message.recipients = await Promise.all(
        message.recipients.map(async (recipientId): Promise<Person> => {
          return this.personRepository
            .createQueryBuilder('person')
            .select()
            .where('person.id = :recipientId', { recipientId })
            .getOne();
        }),
      );
    }
  }
}
