import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class Person {
  @PrimaryColumn()
  employeeId: string;

  @PrimaryColumn()
  email: string;

  @Column({ nullable: true })
  team: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  image72: string;

  @Column({ nullable: true })
  image192: string;

  @Column({ nullable: true })
  image512: string;

  //API response fields
  shoutoutsGiven: Message[];
  shoutoutsReceived: Message[];
}
