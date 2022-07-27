import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Channel } from '../channel/channel.entity';
import { Elements } from '../elements/elements.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createDate: Date;

  @Column()
  authorId: string;

  @Column('simple-array', { array: true })
  recipients: string[];

  @OneToOne(() => Channel)
  @JoinColumn()
  channel: Channel;

  @ManyToMany(() => Message)
  @JoinTable()
  elements: Elements[];
}
