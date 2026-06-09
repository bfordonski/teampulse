import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AvailabilityStatus } from '../../domain/value-objects/availability.vo';

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Min(0)
  @IsInt()
  yearsExperience?: number;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  cvFilePath?: string;
}
