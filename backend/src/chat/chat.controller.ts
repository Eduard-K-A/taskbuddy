import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ChatService } from './chat.service';
import { OpenConversationDto, SendMessageDto } from './dto/chat.dto';
import type { Profile } from '../common/types';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  list(@CurrentUser() user: Profile) {
    return this.chatService.listConversations(user);
  }

  @Post()
  open(@CurrentUser() user: Profile, @Body() dto: OpenConversationDto) {
    return this.chatService.openForJob(user, dto.job_id);
  }

  @Get(':id/messages')
  messages(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatService.getMessages(user, id);
  }

  @Post(':id/messages')
  send(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user, id, dto.body);
  }

  @Post(':id/read')
  read(@CurrentUser() user: Profile, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.markRead(user, id);
  }
}
