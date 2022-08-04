import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { personProviders } from './person.providers';
import { PersonService } from './person.service';

@Module({
  imports: [DatabaseModule],
  providers: [...personProviders, PersonService],
  exports: [PersonService],
})
export class PersonModule {}
