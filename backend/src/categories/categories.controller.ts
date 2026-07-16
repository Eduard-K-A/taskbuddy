import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async list() {
    const { data } = await this.supabase.admin
      .from('service_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('id');
    return data ?? [];
  }
}
