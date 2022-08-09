import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { elementsProviders } from './elements.providers';
import { ElementsService } from './elements.service';

@Module({
  imports: [DatabaseModule],
  providers: [...elementsProviders, ElementsService],
  exports: [ElementsService],
})
export class ElementsModule {}
