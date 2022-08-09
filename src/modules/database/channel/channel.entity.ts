import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slackId: string;

  @Column()
  name: string;

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message;
}
