import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../helpers/config-validation.utility';

@Injectable()
export class DBConfig {
  @IsNotEmpty({
    message: 'Set host to connect to postgres DB',
  })
  postgresHost: string;

  @IsNotEmpty({
    message: 'Set port to connect to postgres DB',
  })
  postgresPort: number;

  @IsNotEmpty({
    message: 'Set correct user to connect to postgres DB',
  })
  postgresUser: string;

  @IsNotEmpty({
    message: 'Set correct password to connect to postgres DB',
  })
  postgresPassword: string;

  @IsNotEmpty({
    message: 'Set correct database name to connect to postgres DB',
  })
  postgresDatabase: string;

  constructor(private configService: ConfigService<object, true>) {
    this.postgresHost = this.configService.get('POSTGRES_HOST');
    this.postgresPort = this.configService.get('POSTGRES_PORT');
    this.postgresUser = this.configService.get('POSTGRES_USER');
    this.postgresPassword = this.configService.get('POSTGRES_PASSWORD');
    this.postgresDatabase = this.configService.get('POSTGRES_DATABASE');

    // Validate after all assignments
    configValidationUtility.validateConfig(this);
  }
}
