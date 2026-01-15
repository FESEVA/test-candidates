import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  schema: process.env.DATABASE_SCHEMA,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  entities: ['src/**/*.entity{.ts,.js}'],
  seeds: ['src/database/seeds/**/*.seed{.ts,.js}'],
  factories: ['src/database/factories/**/*.factory{.ts,.js}'],
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
