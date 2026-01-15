import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { Candidate } from './candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  providers: [CandidateService],
  controllers: [CandidateController],
})
export class CandidateModule {}
