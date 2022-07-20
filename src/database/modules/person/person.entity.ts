import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  team: string;

  @Column()
  country: string;

  @Column()
  name: string;

  @Column()
  image72: string;

  @Column()
  image192: string;

  @Column()
  image512: string;
}
