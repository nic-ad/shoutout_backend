import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MESSAGE_REPOSITORY } from '../constants';
import { CreateMessageDto } from './dto/createMessage.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: Repository<Message>,
  ) {}

  async create(messageData: CreateMessageDto): Promise<Message> {
    const newMessage = await this.messageRepository.create({
      authorId: messageData.authorId,
      channel: messageData.channel,
      elements: messageData.elements,
      recipients: messageData.recipients,
      text: messageData.text,
      createDate: messageData.createDate,
    });
    return this.messageRepository.save(newMessage);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }
}
