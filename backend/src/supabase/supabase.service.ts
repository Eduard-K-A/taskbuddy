import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  /** Service-role client — bypasses RLS. Authorization is enforced in the API layer. */
  readonly admin: SupabaseClient;
  /** Anon client — used only for Supabase Auth calls (sign-up, sign-in, refresh). */
  readonly anon: SupabaseClient;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('SUPABASE_URL');
    this.admin = createClient(
      url,
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    this.anon = createClient(
      url,
      config.getOrThrow<string>('SUPABASE_ANON_KEY'),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }
}
