import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { MESSAGE_REPOSITORY } from '../constants';
import { CreateMessageDto } from './dto/createMessage.dto';

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
    });
    return this.messageRepository.save(newMessage);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }
}
