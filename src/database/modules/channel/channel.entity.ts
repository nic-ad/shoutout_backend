import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  slackId: string;

  @Column()
  name: string;
}
