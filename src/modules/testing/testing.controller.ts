import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.dataSource.query('TRUNCATE TABLE "Users" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "Blogs" CASCADE');
    return {
      status: 'succeeded',
    };
  }
}
