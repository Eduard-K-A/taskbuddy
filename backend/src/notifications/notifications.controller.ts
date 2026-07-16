import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupabaseService } from '../supabase/supabase.service';
import type { Profile } from '../common/types';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async list(@CurrentUser() user: Profile, @Query('unread') unread?: string) {
    let builder = this.supabase.admin
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (unread === 'true') builder = builder.is('read_at', null);
    const { data } = await builder;
    return data ?? [];
  }

  @Post(':id/read')
  async markRead(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { data } = await this.supabase.admin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', user.id)
      .is('read_at', null)
      .select()
      .maybeSingle();
    return data ?? { success: true };
  }

  @Post('read-all')
  async markAllRead(@CurrentUser() user: Profile) {
    await this.supabase.admin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .is('read_at', null);
    return { success: true };
  }
}
