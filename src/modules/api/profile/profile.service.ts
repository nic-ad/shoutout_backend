import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MESSAGE_REPOSITORY, PERSON_REPOSITORY } from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { Raw, Repository } from 'typeorm';
import {
  MANY_PROFILES_LIMIT,
  PROFILE_ID_NOT_FOUND,
  PROFILE_SEARCH_BAD_REQUEST,
} from '../constants';
import { HelperService } from '../helper.service';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(MESSAGE_REPOSITORY) private messageRepository: Repository<Message>,
    private helperService: HelperService,
  ) {}

  async profilesBySearch(searchQueries: any): Promise<Person[]> {
    const nameSearch = searchQueries.name;
    const emailSearch = searchQueries.email;

    if (!nameSearch && !emailSearch) {
      throw new BadRequestException(PROFILE_SEARCH_BAD_REQUEST);
    }

    const query = this.personRepository.createQueryBuilder('person').select();

    if (nameSearch) {
      query.where('LOWER(person.name) LIKE :name', { name: `%${nameSearch.toLowerCase()}%` });
    }

    if (emailSearch) {
      query.orWhere('LOWER(person.email) LIKE :email', { email: `%${emailSearch.toLowerCase()}%` });
    }

    return await query.limit(MANY_PROFILES_LIMIT).getMany();
  }

  async profileById(id: string): Promise<Person> {
    let profile;

    profile = await this.personRepository.findOne({ where: { employeeId: id } });

    if (!profile) {
      throw new NotFoundException(PROFILE_ID_NOT_FOUND);
    }

    const shoutoutsGiven = await this.helperService.getShoutouts().where('shoutout."authorId" = :id', { id }).getMany();
    await this.helperService.mapRecipients(shoutoutsGiven);

    const shoutoutsReceived = await this.messageRepository
      .createQueryBuilder('shoutout')
      .select()
      .innerJoinAndMapOne(
        'shoutout.author',
        Person,
        'person',
        'shoutout."authorId" = person."employeeId"',
      )
      .innerJoinAndSelect('shoutout.elements', 'elements')
      .where(':id = ANY(shoutout.recipients)', { id })
      .getMany();

    await this.helperService.mapRecipients(shoutoutsReceived);

    return {
      ...profile,
      shoutoutsGiven,
      shoutoutsReceived,
    };
  }
}
