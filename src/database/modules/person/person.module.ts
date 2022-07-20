import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { personProviders } from './person.providers';
import { PersonService } from './person.service';

@Module({
  imports: [DatabaseModule],
  providers: [...personProviders, PersonService],
})
export class PersonModule {}
