import { Column, Entity, PrimaryColumn } from 'typeorm';

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

  @Column('text', { nullable: true, array: true })
  skillIds: string[];
}
