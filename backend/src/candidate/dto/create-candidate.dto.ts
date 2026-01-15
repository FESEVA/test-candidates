import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  IsNotEmpty,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Seniority } from '../candidate.entity';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'First name can only contain letters and spaces',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Last name can only contain letters and spaces',
  })
  surname: string;

  @IsEnum(Seniority, {
    message: 'Seniority must be either "junior" or "senior"',
  })
  seniority: Seniority;

  @IsNumber({}, { message: 'Years of experience must be a number' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(50, { message: 'Years of experience cannot exceed 50' })
  @Type(() => Number)
  yearsOfExperience: number;

  @IsBoolean({ message: 'Availability must be true or false' })
  @Type(() => Boolean)
  availability: boolean;
}
