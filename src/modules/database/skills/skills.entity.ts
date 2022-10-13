import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Skills {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;
}
