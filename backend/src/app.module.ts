import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
        const databaseConfig = {
          type: 'postgres' as const,
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          schema: configService.get<string>('DATABASE_SCHEMA'),
          entities: [Candidate],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
          retryAttempts: 5,
          retryDelay: 3000,
        };

        logger.log('🔌 Configuración de TypeORM cargada:');
        logger.log(JSON.stringify(databaseConfig, null, 2));

        return databaseConfig;
      },
      inject: [ConfigService],
    }),

    CandidateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
