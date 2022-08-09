import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
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

  @Column('text', { array: true })
  recipients: string[];

  @OneToOne(() => Channel)
  @JoinColumn()
  channel: Channel;

  @ManyToMany(() => Elements, (element) => element.messages, { cascade: true })
  @JoinTable()
  elements: Elements[];
}
