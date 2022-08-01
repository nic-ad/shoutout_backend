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

  async findPersonAndUpdateImage(slackUser): Promise<Person> {
    try {
      console.log('findPersonAndUpdateImage');
      console.log(slackUser);
      const queryConditions: {
        name?: string;
        email?: string;
      }[] = [{ name: slackUser?.real_name }];

      if (slackUser?.profile?.email) {
        queryConditions.push({
          email: slackUser?.profile?.email,
        });
      }

      const person = await this.personRepository.findOneBy(queryConditions);
      console.log('personService');
      console.log(person);
      person.image72 = slackUser?.profile?.image_72;
      person.image192 = slackUser?.profile?.image_192;
      person.image512 = slackUser?.profile?.image_512;
      return this.personRepository.save(person);
    } catch (error) {
      console.log('findPersonAndUpdateImage: error');
      console.log(error);
      // handleError(error, this.boltApp.client);
    }
  }
}
