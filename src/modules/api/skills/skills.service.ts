import { Inject, Injectable } from '@nestjs/common';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { PERSON_REPOSITORY } from 'src/modules/database/constants';
import { Person } from 'src/modules/database/person/person.entity';
import { Repository, UpdateResult } from 'typeorm';

import { SkillIdsDto } from './dto/skill.ids.dto';

@Injectable()
export class SkillsService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    private algoliaService: AlgoliaService,
  ) {}

  async updateSkills(employeeId: string, skills: SkillIdsDto): Promise<UpdateResult> {
    const updateResult = await this.personRepository.update(
      { employeeId },
      { skillIds: skills.ids },
    );

    //this.algoliaService.modifyIndex()

    return updateResult; //TODO: don't know what we want to return, change as needed
  }
}
