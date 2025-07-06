import { SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UuidEntity } from '../../common/domain/base.entity';
import { User } from '../../user-accounts/domain/entities/user.entity';

@Entity('UserSessions')
export class AuthMeta extends UuidEntity {
  @Column({ nullable: false })
  iat: string;
  @Column({ nullable: false })
  deviceId: string;
  @Column({ nullable: false })
  exp: string;
  @Column({ nullable: false })
  deviceName: string;
  @Column({ nullable: false })
  ipAddress: string;

  @ManyToOne(() => User, (user) => user.authMeta, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;
}

export const AuthMetaSchema = SchemaFactory.createForClass(AuthMeta);

AuthMetaSchema.loadClass(AuthMeta);
