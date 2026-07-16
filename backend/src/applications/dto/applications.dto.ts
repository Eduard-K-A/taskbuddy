import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  cover_message?: string;
}
