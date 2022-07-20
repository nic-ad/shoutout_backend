import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Elements {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  slackUserId: string;
}
