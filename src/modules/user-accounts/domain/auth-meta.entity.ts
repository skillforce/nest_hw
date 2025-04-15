import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateAuthMetaDomainDto } from './dto/create-auth-meta.domain.dto';
import { IsIP } from 'class-validator';
import { UpdateAuthMetaDomainDto } from './dto/update-auth-meta.domain.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Schema({ timestamps: true })
export class AuthMeta {
  @Prop({ type: String, required: true })
  iat: string;
  @Prop({ type: String, required: true })
  user_id: string;
  @Prop({ type: String, required: true })
  device_id: string;
  @Prop({ type: String, required: true })
  exp: string;
  @Prop({ type: String, required: true })
  device_name: string;

  @Prop({ type: String, required: true })
  @IsIP()
  ip_address: string;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
    //eslint-disable-next-line
    return this._id.toString();
  }

  static createInstance(
    authMetaDto: CreateAuthMetaDomainDto,
  ): AuthMetaDocument {
    const authMetaSession = new this() as AuthMetaDocument;

    authMetaSession.iat = authMetaDto.iat;
    authMetaSession.user_id = authMetaDto.user_id;
    authMetaSession.device_id = authMetaDto.device_id;
    authMetaSession.exp = authMetaDto.exp;
    authMetaSession.device_name = authMetaDto.device_name;
    authMetaSession.ip_address = authMetaDto.ip_address;

    return authMetaSession;
  }

  updateInstance(updateAuthMetaDto: UpdateAuthMetaDomainDto) {
    this.iat = updateAuthMetaDto.iat;
    this.exp = updateAuthMetaDto.exp;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Session already deleted',
      });
    }
    this.deletedAt = new Date();
  }
}

export const AuthMetaSchema = SchemaFactory.createForClass(AuthMeta);

AuthMetaSchema.loadClass(AuthMeta);

export type AuthMetaDocument = HydratedDocument<AuthMeta>;

export type AuthMetaModelType = Model<AuthMetaDocument> & typeof AuthMeta;
