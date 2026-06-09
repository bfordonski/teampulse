import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { AvailabilityStatus } from '../../domain/value-objects/availability.vo';
import { SkillCategory } from '../../domain/value-objects/skill-category.vo';

class SkillDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @IsOptional()
  @Min(1)
  @Max(5)
  level?: number;

  @IsOptional()
  @Min(0)
  yearsUsed?: number;
}

class LanguageDto {
  @IsString()
  language!: string;

  @IsString()
  level!: string;
}

class ProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  startYear?: number;

  @IsOptional()
  @IsInt()
  endYear?: number;
}

export class CreateCandidateDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  title!: string;

  @Min(0)
  yearsExperience!: number;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  cvFilePath?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages?: LanguageDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryExperience?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificates?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedClients?: string[];
}
