import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { NumericIdEntity } from '../../../common/domain/base.entity';
import { PasswordRecoveryConfirmation } from './password-recovery-confirmation.entity';
import { EmailConfirmation } from './email-confirmation.entity';
import { AuthMeta } from '../../../security-devices/domain/auth-meta.entity';
import { Length } from 'class-validator';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Entity('Users')
export class User extends NumericIdEntity {
  @Column({ nullable: false })
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  passwordHash: string;

  @OneToOne(
    () => PasswordRecoveryConfirmation,
    (PasswordRecoveryConfirmation) => PasswordRecoveryConfirmation.user,
    {
      onDelete: 'CASCADE',
    },
  )
  public passwordRecoveryConfirmation?: PasswordRecoveryConfirmation;

  @OneToOne(
    () => EmailConfirmation,
    (EmailConfirmation) => EmailConfirmation.user,
    {
      onDelete: 'CASCADE',
    },
  )
  public emailConfirmation?: EmailConfirmation;

  @OneToMany(() => AuthMeta, (authMeta) => authMeta.user)
  public authMeta?: AuthMeta[];
}
