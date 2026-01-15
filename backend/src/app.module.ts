import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CandidateModule } from './candidate/candidate.module';
import { Candidate } from './candidate/candidate.entity';

const logger = new Logger('AppModule');
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const databaseUrl = configService.get<string>('DATABASE_URL');

        const databaseConfig = {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get<string>('DATABASE_USERNAME'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_NAME'),
                schema: configService.get<string>('DATABASE_SCHEMA'),
              }),
          entities: [Candidate],
          synchronize: !isProduction, // Never synchronize in production!
          logging: configService.get<string>('NODE_ENV') === 'development',
          ssl: isProduction ? { rejectUnauthorized: false } : false, // Required for most cloud DBs
          retryAttempts: 5,
          retryDelay: 3000,
        };

        logger.log(
          `🔌 Database connected via ${databaseUrl ? 'URL' : 'Individual Config'}`,
        );
        return databaseConfig;
      },
      inject: [ConfigService],
    }),

    CandidateModule,
  ],
})
export class AppModule {}
