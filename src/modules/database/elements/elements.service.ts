import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ELEMENTS_REPOSITORY } from '../constants';
import CreateElementsDto from './dto/createElements.dto';
import { Elements } from './elements.entity';

@Injectable()
export class ElementsService {
  constructor(
    @Inject(ELEMENTS_REPOSITORY)
    private elementsRepository: Repository<Elements>,
  ) {}

  async create(elementData: CreateElementsDto): Promise<Elements> {
    const newElement = await this.elementsRepository.create({
      text: elementData.text,
      type: elementData.type,
      employeeId: elementData.employeeId,
    });
    return this.elementsRepository.save(newElement);
  }

  async findAll(): Promise<Elements[]> {
    return this.elementsRepository.find();
  }
}
