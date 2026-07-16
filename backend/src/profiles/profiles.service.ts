import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  SetAvailabilityDto,
  UpdateProfileDto,
  UpsertProviderProfileDto,
} from './dto/profiles.dto';
import type { Profile } from '../common/types';

@Injectable()
export class ProfilesService {
  constructor(private readonly supabase: SupabaseService) {}

  async updateProfile(user: Profile, dto: UpdateProfileDto) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .update({ ...dto })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async upsertProviderProfile(user: Profile, dto: UpsertProviderProfileDto) {
    const { data: category } = await this.supabase.admin
      .from('service_categories')
      .select('id')
      .eq('id', dto.category_id)
      .eq('is_active', true)
      .maybeSingle();
    if (!category)
      throw new BadRequestException('Unknown or inactive category_id');

    // cached_* columns are intentionally never written here — triggers own them.
    const { data, error } = await this.supabase.admin
      .from('provider_profiles')
      .upsert(
        {
          profile_id: user.id,
          category_id: dto.category_id,
          bio: dto.bio,
          years_experience: dto.years_experience ?? 0,
          service_radius_km: dto.service_radius_km ?? 15.0,
        },
        { onConflict: 'profile_id' },
      )
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async setAvailability(user: Profile, dto: SetAvailabilityDto) {
    const { data, error } = await this.supabase.admin
      .from('provider_profiles')
      .update({ is_available: dto.is_available })
      .eq('profile_id', user.id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Provider profile not set up yet');
    return data;
  }
}
