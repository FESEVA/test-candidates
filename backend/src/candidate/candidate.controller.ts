import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Candidate } from './candidate.entity';
import { UploadCandidateDto } from './dto/upload-candidate.dto';

@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidateService.create(createCandidateDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('excelFile'))
  @HttpCode(HttpStatus.CREATED)
  uploadCandidate(
    @Body() body: UploadCandidateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidateService.processExcelAndCreate(
      body.name,
      body.surname,
      file.buffer,
    );
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('seniority') seniority?: string,
    @Query('minYears', new ParseIntPipe({ optional: true })) minYears?: number,
    @Query('available', new ParseBoolPipe({ optional: true }))
    available?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<{ data: Candidate[]; meta: any }> {
    const candidates = await this.candidateService.findAll({
      name,
      seniority,
      minYears,
      availability: available,
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCandidates = candidates.slice(startIndex, endIndex);

    return {
      data: paginatedCandidates,
      meta: {
        total: candidates.length,
        page,
        limit,
        totalPages: Math.ceil(candidates.length / limit),
        hasNextPage: endIndex < candidates.length,
        hasPreviousPage: page > 1,
      },
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.candidateService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.candidateService.remove(id);
  }
}
