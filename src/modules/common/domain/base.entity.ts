import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn({ default: null })
  deletedAt?: Date | null;
}

@Entity()
export class NumericIdEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

@Entity()
export class UuidEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
