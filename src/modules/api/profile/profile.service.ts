import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MESSAGE_REPOSITORY, PERSON_REPOSITORY } from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { Repository } from 'typeorm';

import {
  MANY_PROFILES_LIMIT,
  PROFILE_ID_NOT_FOUND,
  PROFILE_SEARCH_BAD_REQUEST,
} from '../constants';
import { HelperService } from '../helper.service';
import { ShoutoutDto } from '../shoutouts/dto/shoutout.dto';
import { BasicProfileDto, FullProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(MESSAGE_REPOSITORY) private messageRepository: Repository<Message>,
    private helperService: HelperService,
  ) {}

  async profilesBySearch(searchQueries: any): Promise<BasicProfileDto[]> {
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

  async profileById(id: string): Promise<FullProfileDto> {
    const profile = await this.personRepository.findOne({ where: { employeeId: id } });

    if (!profile) {
      throw new NotFoundException(PROFILE_ID_NOT_FOUND);
    }

    const shoutoutsGiven: ShoutoutDto[] = await this.helperService
      .getShoutouts()
      .where('shoutout."authorId" = :id', { id })
      .getMany();
    await this.helperService.postProcessShoutouts(shoutoutsGiven);

    const shoutoutsReceived: ShoutoutDto[] = await this.messageRepository
      .createQueryBuilder('shoutout')
      .select()
      .innerJoinAndMapOne(
        'shoutout.author',
        Person,
        'person',
        'shoutout."authorId" = person."employeeId"',
      )
      .innerJoinAndSelect('shoutout.elements', 'elements')
      .innerJoinAndSelect('shoutout.channel', 'channel')
      .where(':id = ANY(shoutout.recipients)', { id })
      .getMany();

    await this.helperService.postProcessShoutouts(shoutoutsReceived);

    return {
      ...profile,
      shoutoutsGiven,
      shoutoutsReceived,
    };
  }
}
