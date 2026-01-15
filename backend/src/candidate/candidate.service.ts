import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import * as XLSX from 'xlsx';
import { SqlSanitizer } from 'src/common/sanitizers/sql-sanitizer.util';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    try {
      const sanitizedDto = {
        ...createCandidateDto,
        name: SqlSanitizer.sanitizeString(createCandidateDto.name),
        surname: SqlSanitizer.sanitizeString(createCandidateDto.surname),
      };

      this.validateDtoForSqlInjection(sanitizedDto);

      const candidate = this.candidateRepository.create(sanitizedDto);
      return await this.candidateRepository.save(candidate);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El candidato ya existe');
      }
      throw new InternalServerErrorException('Error al crear el candidato');
    }
  }

  async findAll(filters: {
    name?: string;
    seniority?: string;
    minYears?: number;
    availability?: boolean;
  }): Promise<Candidate[]> {
    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .orderBy('candidate.createdAt', 'DESC');

      if (filters.name) {
        const sanitizedName = SqlSanitizer.sanitizeString(filters.name);
        queryBuilder.andWhere(
          '(LOWER(candidate.name) LIKE LOWER(:name) OR LOWER(candidate.surname) LIKE LOWER(:name))',
          { name: `%${sanitizedName}%` },
        );
      }

      if (filters.seniority) {
        const seniorityValue = SqlSanitizer.sanitizeString(filters.seniority);
        queryBuilder.andWhere('candidate.seniority = :seniority', {
          seniority: seniorityValue,
        });
      }

      if (filters.minYears !== undefined) {
        const minYears = Number(filters.minYears);
        queryBuilder.andWhere('candidate.yearsOfExperience >= :minYears', {
          minYears,
        });
      }
      if (filters.availability !== undefined) {
        queryBuilder.andWhere('candidate.availability = :availability', {
          availability: filters.availability,
        });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los candidatos');
    }
  }

  async findOne(id: number): Promise<Candidate> {
    try {
      const candidate = await this.candidateRepository.findOne({
        where: { id },
      });

      if (!candidate) {
        throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
      }

      return candidate;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el candidato');
    }
  }

  async update(
    id: number,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Candidate> {
    try {
      const candidate = await this.findOne(id);

      this.validateDtoForSqlInjection(updateCandidateDto);

      Object.assign(candidate, updateCandidateDto);

      return await this.candidateRepository.save(candidate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar el candidato',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const candidate = await this.findOne(id);
      await this.candidateRepository.remove(candidate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el candidato');
    }
  }

  async processExcelAndCreate(
    name: string,
    surname: string,
    excelBuffer: Buffer,
  ): Promise<Candidate> {
    try {
      const excelData = this.parseExcelFile(excelBuffer);

      this.validateExcelData(excelData);

      const createCandidateDto: CreateCandidateDto = {
        name,
        surname,
        seniority: excelData.seniority,
        yearsOfExperience: Number(excelData.yearsOfExperience),
        availability: this.parseBoolean(excelData.availability),
      };

      return await this.create(createCandidateDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al procesar el archivo Excel',
      );
    }
  }

  private parseExcelFile(buffer: Buffer): any {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío');
      }

      return data[0];
    } catch (error) {
      throw new BadRequestException('Error al leer el archivo Excel');
    }
  }

  private validateExcelData(data: any): void {
    const requiredColumns = ['seniority', 'yearsOfExperience', 'availability'];

    for (const column of requiredColumns) {
      if (!(column in data)) {
        throw new BadRequestException(
          `Falta la columna requerida: ${column}. Columnas requeridas: ${requiredColumns.join(', ')}`,
        );
      }
    }

    const validSeniorities = ['junior', 'senior'];
    if (!validSeniorities.includes(data.seniority?.toLowerCase())) {
      throw new BadRequestException(
        `Seniority debe ser uno de: ${validSeniorities.join(', ')}. Valor recibido: ${data.seniority}`,
      );
    }

    const years = Number(data.yearsOfExperience);
    if (isNaN(years) || years < 0 || years > 50) {
      throw new BadRequestException(
        `Años de experiencia debe ser un número entre 0 y 50. Valor recibido: ${data.yearsOfExperience}`,
      );
    }
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (
        lower === 'true' ||
        lower === '1' ||
        lower === 'yes' ||
        lower === 'si'
      )
        return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    throw new BadRequestException(`Valor de disponibilidad inválido: ${value}`);
  }

  private validateDtoForSqlInjection(dto: any): void {
    Object.entries(dto).forEach(([key, value]) => {
      if (typeof value === 'string' && SqlSanitizer.hasSqlInjection(value)) {
        throw new BadRequestException(
          `Campo '${key}' contiene código SQL peligroso`,
        );
      }
    });
  }
}
