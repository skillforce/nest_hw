import { IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class IdMongoParamDto {
  @IsMongoId()
  id: string;
}

export class IdStringParamDto {
  id: string;
}
export class IdNumberParamDto {
  @Type(() => Number)
  @IsNumber()
  id: number;
}
