import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { PERSON_REPOSITORY, SKILLS_REPOSITORY } from 'src/modules/database/constants';
import { Person } from 'src/modules/database/person/person.entity';
import { Skills } from 'src/modules/database/skills/skills.entity';
import { Repository } from 'typeorm';

import { PROFILE_ID_NOT_FOUND } from '../constants';
import { HelperService } from '../helper.service';
import { SkillsProfileDto } from '../profile/dto/profile.dto';
import { SkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: Repository<Skills>,
    private algoliaService: AlgoliaService,
    private helperService: HelperService,
  ) {}

  async updateSkills(employeeId: string, skillIds: string[]): Promise<SkillsProfileDto> {
    const person = await this.personRepository.findOne({ where: { employeeId } });

    if (!person) {
      throw new BadRequestException(PROFILE_ID_NOT_FOUND);
    }

    await this.personRepository.update({ employeeId }, { skillIds });

    const skillDetails = await this.helperService.getSkillDetails(skillIds);
    delete person.skillIds;

    this.algoliaService.modifyIndex({
      ...person,
      skills: skillDetails,
    });

    return {
      ...person,
      skills: skillDetails,
    };
  }

  async getAllSkills(): Promise<SkillDto[]> {
    return await this.skillsRepository.find();
  }
}
