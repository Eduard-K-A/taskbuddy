import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { JobStatus, UserRole } from '../../common/types';

export class ListUsersQueryDto {
  /** Matches full_name or email, case-insensitive. */
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['client', 'provider', 'admin'])
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'suspended'])
  status?: 'active' | 'suspended';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number;
}

export class ListBookingsQueryDto {
  @IsOptional()
  @IsIn([
    'open',
    'recommending',
    'assigned',
    'in_progress',
    'completed',
    'cancelled',
    'expired',
  ])
  status?: JobStatus;

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
