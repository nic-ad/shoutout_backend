import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    let queryConditions = [];

    if (nameSearch) {
      queryConditions.push({
        name: Raw(
          (name) => `LOWER(${name}) LIKE '%${nameSearch.toLowerCase()}%'`,
        ),
      });
    }

    if (emailSearch) {
      queryConditions.push({
        email: Raw(
          (email) => `LOWER(${email}) LIKE '%${emailSearch.toLowerCase()}%'`,
        ),
      });
    }

    if (!queryConditions.length) {
      throw new BadRequestException(PROFILE_SEARCH_BAD_REQUEST);
    }

    return await this.personRepository.find({
      where: queryConditions,
      take: MANY_PROFILES_LIMIT,
    });
  }

  async profileById(id: string): Promise<Person> {
    let profile;

    profile = await this.personRepository
      .createQueryBuilder('person')
      .where('person.employeeId = :id', { id })
      .getOne();

    if (!profile) {
      throw new NotFoundException(PROFILE_ID_NOT_FOUND);
    }

    const shoutoutsGiven = await this.helperService
      .getShoutoutsWithAuthor(id)
      .getMany();

    await this.helperService.mapRecipients(shoutoutsGiven);

    const shoutoutsReceived = await this.helperService
      .getShoutoutsWithAuthor()
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
