import { Inject, Injectable } from '@nestjs/common';
import {
  MESSAGE_REPOSITORY,
  PERSON_REPOSITORY,
  SKILLS_REPOSITORY,
} from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Skills } from '../database/skills/skills.entity';
import { BasicProfileDto } from './profile/dto/profile.dto';
import { ShoutoutDto } from './shoutouts/dto/shoutout.dto';
import { SkillDto } from './skills/dto/skill.dto';

@Injectable()
export class HelperService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(MESSAGE_REPOSITORY) private messageRepository: Repository<Message>,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: Repository<Skills>,
  ) {}

  /**
   * Maps fields from Person entity for each shoutout's author based on id, as well as retrieves each shoutout's
   * elements (items that comprise the actual shououtout e.g. its text and any slack users that were @'d) and channel
   * @param personId specific author to join shoutouts on (if not passed in, each shoutout just joins to its author)
   */
  getShoutouts(personId?: string): SelectQueryBuilder<Message> {
    const id = personId ? "'" + personId + "'" : 'person."employeeId"';

    return this.messageRepository
      .createQueryBuilder('shoutout')
      .innerJoinAndMapOne('shoutout.author', Person, 'person', `shoutout."authorId" = ${id}`)
      .innerJoinAndSelect('shoutout.elements', 'elements')
      .innerJoinAndSelect('shoutout.channel', 'channel');
  }

  /**
   * Maps each shoutout's array of recipient ids into actual Person entity fields,
   * as well as sorts each shoutout's elements to ensure correct order of words in shoutout
   * @param shoutouts list of shoutouts, each with array of recipient ids
   */
  async postProcessShoutouts(shoutouts: ShoutoutDto[]): Promise<void> {
    for (const message of shoutouts) {
      message.elements = message.elements.sort((a, b) => a.id - b.id);

      message.recipients = await Promise.all(
        message.recipients.map(async (recipientId): Promise<BasicProfileDto> => {
          return this.personRepository.findOne({ where: { employeeId: recipientId } });
        }),
      );
    }
  }

  async getSkillDetails(skillIds: string[]): Promise<SkillDto[]> {
    return await this.skillsRepository
      .createQueryBuilder('skills')
      .select()
      .where('skills.id::text = ANY(:skillIds)', { skillIds })
      .getMany();
  }
}
