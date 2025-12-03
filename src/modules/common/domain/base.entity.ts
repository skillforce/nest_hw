import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn()
  createdAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
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
