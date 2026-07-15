import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../supabase/supabase.service';
import { ROLES_KEY } from './roles.decorator';
import type { Profile, UserRole } from '../common/types';

/**
 * Validates the `Authorization: Bearer <supabase access token>` header,
 * loads the caller's `profiles` row onto `request.user`, and enforces
 * any `@Roles(...)` restriction on the handler.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      throw new UnauthorizedException('Missing Authorization bearer token');
    }

    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { data: profile, error: profileError } = await this.supabase.admin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      throw new UnauthorizedException('No profile found for this user');
    }
    if ((profile as Profile).deactivated_at) {
      throw new ForbiddenException('Account is deactivated');
    }

    request.user = profile as Profile;
    request.accessToken = token;

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (
      roles &&
      roles.length > 0 &&
      !roles.includes((profile as Profile).role)
    ) {
      throw new ForbiddenException(
        `This endpoint requires role: ${roles.join(' or ')}`,
      );
    }
    return true;
  }
}
