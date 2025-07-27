import {
  CreateDateColumn,
  DeleteDateColumn,
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

export abstract class NumericIdEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

export abstract class UuidEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
