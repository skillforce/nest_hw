import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.databaseConnection.dropDatabase();
    await this.dataSource.query('TRUNCATE TABLE "Users" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "Blogs" CASCADE');
    return {
      status: 'succeeded',
    };
  }
}
