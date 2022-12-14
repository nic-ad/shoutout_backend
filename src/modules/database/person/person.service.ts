import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { PERSON_REPOSITORY } from '../constants';
import { Person } from './person.entity';

@Injectable()
export class PersonService {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private personRepository: Repository<Person>,
  ) {}

  async findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }

  async findPerson(slackUser): Promise<Person> {
    const queryConditions: {
      name?: string;
      email?: string;
    }[] = [{ name: slackUser?.real_name }];

    if (slackUser?.profile?.email) {
      queryConditions.push({
        email: slackUser?.profile?.email,
      });
    }

    return await this.personRepository.findOneBy(queryConditions);
  }

  async findPersonAndUpdateImage(slackUser): Promise<Person> {
    try {
      const person = await this.findPerson(slackUser);
      person.image72 = slackUser?.profile?.image_72;
      person.image192 = slackUser?.profile?.image_192;
      person.image512 = slackUser?.profile?.image_512;
      return this.personRepository.save(person);
    } catch (error) {
      console.log('findPersonAndUpdateImage: error');
      console.log(error);
      // logError(error, this.boltApp.client);
    }
  }
}
