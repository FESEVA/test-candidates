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
import { toCamelCase } from 'src/common/utils/string.utils';

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
        throw new BadRequestException('Candidate already exists');
      }
      console.error(error);
      throw new InternalServerErrorException('Error creating candidate');
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
      console.error(error);
      throw new InternalServerErrorException('Error retrieving candidates');
    }
  }

  async findOne(id: number): Promise<Candidate> {
    try {
      const candidate = await this.candidateRepository.findOne({
        where: { id },
      });

      if (!candidate) {
        throw new NotFoundException(`Candidate with ID ${id} not found`);
      }

      return candidate;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Error retrieving candidate');
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
      console.error(error);
      throw new InternalServerErrorException('Error updating candidate');
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
      console.error(error);
      throw new InternalServerErrorException('Error deleting candidate');
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
      console.error(error);
      throw new InternalServerErrorException('Error processing Excel file');
    }
  }

  private parseExcelFile(buffer: Buffer): any {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      const excelData: any = data[0];

      const formattedData: any = {};
      Object.keys(excelData).forEach((key) => {
        const camelKey = toCamelCase(key);
        formattedData[camelKey] = excelData[key];
      });

      return formattedData;
    } catch (error) {
      throw new BadRequestException('Error reading Excel file');
    }
  }

  private validateExcelData(data: any): void {
    const requiredColumns = ['seniority', 'yearsOfExperience', 'availability'];

    const dataKeys = Object.keys(data);

    dataKeys.forEach((key) => {
      if (!requiredColumns.includes(key)) {
        throw new BadRequestException(`Column '${key}' is not allowed.`);
      }
    });

    requiredColumns.forEach((col) => {
      const value = data[col];
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        throw new BadRequestException(
          `Column '${col}' is required and cannot be empty.`,
        );
      }
    });

    const validSeniorities = ['junior', 'senior'];
    if (!validSeniorities.includes(data.seniority)) {
      throw new BadRequestException(
        `Seniority must be one of: ${validSeniorities.join(', ')}. Received: ${data.seniority}`,
      );
    }

    const years = Number(data.yearsOfExperience);
    if (isNaN(years) || years < 0 || years > 50) {
      throw new BadRequestException(
        `Years of experience must be a number between 0 and 50. Received: ${data.yearsOfExperience}`,
      );
    }

    const availabilityValue = data.availability;
    try {
      this.parseBoolean(availabilityValue);
    } catch {
      throw new BadRequestException(
        `Availability must be a boolean value (true/false, 1/0, yes/no). Received: ${availabilityValue}`,
      );
    }
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    throw new BadRequestException(`Invalid availability value: ${value}`);
  }

  private validateDtoForSqlInjection(dto: any): void {
    Object.entries(dto).forEach(([key, value]) => {
      if (typeof value === 'string' && SqlSanitizer.hasSqlInjection(value)) {
        throw new BadRequestException(
          `Field '${key}' contains dangerous SQL code`,
        );
      }
    });
  }
}
