import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';
import type { Profile } from '../common/types';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Creates the auth user with role/full_name metadata; the on_auth_user_created
   * DB trigger creates the matching `profiles` row.
   */
  async register(dto: RegisterDto) {
    const { data, error } = await this.supabase.anon.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          role: dto.role,
          full_name: dto.full_name,
          phone: dto.phone ?? null,
        },
      },
    });
    if (error) throw new BadRequestException(error.message);
    return {
      user: { id: data.user?.id, email: data.user?.email },
      // Session is null when email confirmation is enabled on the Supabase project.
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.anon.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error) throw new UnauthorizedException(error.message);
    return {
      user: { id: data.user.id, email: data.user.email },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    const { data, error } = await this.supabase.anon.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });
    if (error || !data.session) {
      throw new UnauthorizedException(
        error?.message ?? 'Could not refresh session',
      );
    }
    return {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  async logout(accessToken: string) {
    await this.supabase.admin.auth.admin.signOut(accessToken);
    return { success: true };
  }

  /** Profile plus the provider extension when the caller is a provider. */
  async me(user: Profile) {
    if (user.role !== 'provider')
      return { profile: user, provider_profile: null };
    const { data } = await this.supabase.admin
      .from('provider_profiles')
      .select('*, service_categories(name)')
      .eq('profile_id', user.id)
      .maybeSingle();
    return { profile: user, provider_profile: data };
  }
}
