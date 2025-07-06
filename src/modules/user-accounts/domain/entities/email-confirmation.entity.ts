import { NumericIdEntity } from '../../../common/domain/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('EmailConfirmations')
export class EmailConfirmation extends NumericIdEntity {
  @Column({ nullable: true, type: 'uuid' })
  confirmationCode: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  confirmationExpiresAt: Date | null;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column()
  userId: number;

  @OneToOne(() => User, (user) => user.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
