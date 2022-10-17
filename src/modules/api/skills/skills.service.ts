import { Inject, Injectable } from '@nestjs/common';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { PERSON_REPOSITORY } from 'src/modules/database/constants';
import { Person } from 'src/modules/database/person/person.entity';
import { Repository, UpdateResult } from 'typeorm';

import { BasicProfileDto } from '../profile/dto/profile.dto';

@Injectable()
export class SkillsService {
  constructor(
    @Inject(PERSON_REPOSITORY) private personRepository: Repository<Person>,
    private algoliaService: AlgoliaService,
  ) {}

  async updateSkills(profileDto: BasicProfileDto): Promise<UpdateResult> {
    const updateResult = await this.personRepository.update(
      { employeeId: profileDto.employeeId },
      { skillIds: profileDto.skillIds },
    );

    //this.algoliaService.modifyIndex()

    return updateResult; //TODO: don't know what we want to return, change as needed
  }
}
