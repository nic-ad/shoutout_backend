import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class Elements {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  employeeId: string;

  @ManyToMany(() => Message, (message) => message.elements)
  messages: Message[];
}
