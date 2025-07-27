import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();
console.log(process.env);

export default new DataSource({
  url: process.env.DATABASE_URL,
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT as unknown as number,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: false,
  migrations: ['src/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
});
