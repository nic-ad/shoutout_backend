import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class Elements {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: '' })
  text: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  employeeId: string;

  @ManyToOne(() => Message, message => message.elements, { onDelete: 'CASCADE' })
  message: Message;
}
