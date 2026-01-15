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
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  surname?: string;

  @IsOptional()
  @IsEnum(Seniority, {
    message: 'Seniority debe ser "junior" o "senior"',
  })
  seniority?: Seniority;

  @IsOptional()
  @IsNumber({}, { message: 'Los años de experiencia deben ser un número' })
  @Min(0, { message: 'Los años de experiencia no pueden ser negativos' })
  @Max(50, { message: 'Los años de experiencia no pueden ser más de 50' })
  @Type(() => Number)
  yearsOfExperience?: number;

  @IsOptional()
  @IsBoolean({ message: 'Disponibilidad debe ser true o false' })
  @Type(() => Boolean)
  availability?: boolean;
}
