import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import type { BookingStatus } from '../../common/types';

export class ListBookingsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class CreateBookingDto {
  @IsUUID()
  job_id!: string;

  @IsISO8601()
  scheduled_at!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  duration_minutes?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsISO8601()
  scheduled_at?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  duration_minutes?: number;

  @IsOptional()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
