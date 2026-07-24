import { IsString, IsUUID, Length } from 'class-validator';

export class OpenConversationDto {
  @IsUUID()
  job_id!: string;
}

export class SendMessageDto {
  @IsString()
  @Length(1, 1000)
  body!: string;
}
