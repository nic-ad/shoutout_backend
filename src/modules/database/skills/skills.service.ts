import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SKILLS_REPOSITORY } from '../constants';
import { Skills } from './skills.entity';

@Injectable()
export class SkillsService {
  constructor(
    @Inject(SKILLS_REPOSITORY)
    private skillsRepository: Repository<Skills>,
  ) {}
}
