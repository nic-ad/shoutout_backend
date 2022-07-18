import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Elements } from './elements.entity';
import { ELEMENTS_REPOSITORY } from '../../constants';

@Injectable()
export class ElementsService {
  constructor(
    @Inject(ELEMENTS_REPOSITORY)
    private elementsRepository: Repository<Elements>,
  ) {}

  async findAll(): Promise<Elements[]> {
    return this.elementsRepository.find();
  }
}
