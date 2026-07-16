import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import type { JobUrgency } from '../../common/types';

export class CreateJobDto {
  @IsInt()
  @Type(() => Number)
  category_id!: number;

  // Length bounds mirror the DB CHECK constraints (schema §3).
  @IsString()
  @Length(5, 120)
  title!: string;

  @IsString()
  @Length(20, 750)
  description!: string;

  @IsOptional()
  @IsIn(['urgent', 'normal', 'flexible'])
  urgency?: JobUrgency;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsLatitude()
  @Type(() => Number)
  latitude!: number;

  @IsLongitude()
  @Type(() => Number)
  longitude!: number;
}

export class BrowseJobsQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category_id?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number;
}
