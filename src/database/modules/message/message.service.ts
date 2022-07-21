import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { MESSAGE_REPOSITORY } from '../../constants';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: Repository<Message>,
  ) {}

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }
}
