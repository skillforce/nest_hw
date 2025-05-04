import { IsMongoId, IsUUID } from 'class-validator';

export class IdMongoParamDto {
  @IsMongoId()
  id: string;
}
export class IdUuidParamDto {
  @IsUUID()
  id: string;
}

export class IdStringParamDto {
  id: string;
}
export class IdNumberParamDto {
  id: number;
}
