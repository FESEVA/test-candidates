import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Seniority {
  JUNIOR = 'junior',
  SENIOR = 'senior',
}

@Entity('candidate')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({
    type: 'enum',
    enum: Seniority,
  })
  seniority: Seniority;

  @Column('int')
  yearsOfExperience: number;

  @Column('boolean')
  availability: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
