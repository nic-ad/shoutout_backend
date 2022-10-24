import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MESSAGE_REPOSITORY,
  PERSON_REPOSITORY,
  SKILLS_REPOSITORY,
} from 'src/modules/database/constants';
import { Message } from 'src/modules/database/message/message.entity';
import { Person } from 'src/modules/database/person/person.entity';
import { Skills } from 'src/modules/database/skills/skills.entity';
import { IsNull, Not, Repository } from 'typeorm';

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
    @Inject(SKILLS_REPOSITORY) private skillsRepository: Repository<Skills>,
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

    const skills = await this.helperService.getSkillDetails(profile.skillIds);

    //no need for list of ids on the response since skills objects contain ids and more
    delete profile.skillIds;

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
      skills,
      shoutoutsGiven,
      shoutoutsReceived,
    };
  }

  async profilesWithSkills(): Promise<FullProfileDto[]> {
    const profiles = await this.personRepository.find({ where: { skillIds: Not(IsNull()) }});
    const profilesWithSkills = [];

    for(let i = 0; i < profiles.length; i++){
      const skills = await this.helperService.getSkillDetails(profiles[i].skillIds);

      //no need for list of ids on the response since skills objects contain ids and more
      delete profiles[i].skillIds;

      const shoutoutsGiven = [];
      const shoutoutsReceived = [];

      profilesWithSkills.push({
        ...profiles[i],
        skills,
        shoutoutsGiven,
        shoutoutsReceived,
      });
    }

    return profilesWithSkills;
  }
}
