import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { PERSON_REPOSITORY } from '../constants';

@Injectable()
export class PersonService {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private personRepository: Repository<Person>,
  ) {}

  async findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }
}
