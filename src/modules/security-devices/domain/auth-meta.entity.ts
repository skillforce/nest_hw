import { SchemaFactory } from '@nestjs/mongoose';
import { CreateAuthMetaDomainDto } from './dto/create-auth-meta.domain.dto';
import { UpdateAuthMetaDomainDto } from './dto/update-auth-meta.domain.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

export class AuthMeta {
  id: string;
  iat: string;
  userId: string;
  deviceId: string;
  exp: string;
  deviceName: string;
  ipAddress: string;
  deletedAt: Date | null;
  createdAt?: Date;

  // static createInstance(authMetaDto: CreateAuthMetaDomainDto): AuthMeta {
  //   const authMetaSession = new this();
  //
  //   authMetaSession.iat = authMetaDto.iat;
  //   authMetaSession.userId = authMetaDto.userId;
  //   authMetaSession.deviceId = authMetaDto.deviceId;
  //   authMetaSession.exp = authMetaDto.exp;
  //   authMetaSession.deviceName = authMetaDto.deviceName;
  //   authMetaSession.ipAddress = authMetaDto.ipAddress;
  //   authMetaSession.deletedAt = null;
  //
  //   return authMetaSession;
  // }

  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Session already deleted',
  //     });
  //   }
  //   this.deletedAt = new Date();
  // }
}

export const AuthMetaSchema = SchemaFactory.createForClass(AuthMeta);

AuthMetaSchema.loadClass(AuthMeta);
