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
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El apellido solo puede contener letras y espacios',
  })
  surname: string;

  @IsEnum(Seniority, {
    message: 'Seniority debe ser "junior" o "senior"',
  })
  seniority: Seniority;

  @IsNumber({}, { message: 'Los años de experiencia deben ser un número' })
  @Min(0, { message: 'Los años de experiencia no pueden ser negativos' })
  @Max(50, { message: 'Los años de experiencia no pueden ser más de 50' })
  @Type(() => Number)
  yearsOfExperience: number;

  @IsBoolean({ message: 'Disponibilidad debe ser true o false' })
  @Type(() => Boolean)
  availability: boolean;
}
