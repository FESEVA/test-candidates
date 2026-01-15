import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Seniority } from '../candidate.entity';

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  surname?: string;

  @IsOptional()
  @IsEnum(Seniority, {
    message: 'Seniority must be either "junior" or "senior"',
  })
  seniority?: Seniority;

  @IsOptional()
  @IsNumber({}, { message: 'Years of experience must be a number' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(50, { message: 'Years of experience cannot exceed 50' })
  @Type(() => Number)
  yearsOfExperience?: number;

  @IsOptional()
  @IsBoolean({ message: 'Availability must be true or false' })
  @Type(() => Boolean)
  availability?: boolean;
}
