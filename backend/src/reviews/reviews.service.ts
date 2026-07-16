import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateReviewDto } from './dto/reviews.dto';
import type { Profile } from '../common/types';

@Injectable()
export class ReviewsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(user: Profile, jobId: string, dto: CreateReviewDto) {
    const { data: job } = await this.supabase.admin
      .from('jobs')
      .select('id, title, status, client_id, assigned_provider_id')
      .eq('id', jobId)
      .maybeSingle();
    if (!job) throw new NotFoundException('Job not found');
    if (job.client_id !== user.id) throw new ForbiddenException('Not your job');
    if (job.status !== 'completed') {
      throw new BadRequestException('You can only review completed jobs');
    }

    // Insert fires the trigger that refreshes the provider's cached rating.
    const { data, error } = await this.supabase.admin
      .from('reviews')
      .insert({
        job_id: jobId,
        client_id: user.id,
        provider_id: job.assigned_provider_id,
        rating: dto.rating,
        comment: dto.comment ?? null,
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('This job already has a review');
      }
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async listForProvider(providerId: string) {
    const { data } = await this.supabase.admin
      .from('reviews')
      .select(
        'id, rating, comment, created_at, client:profiles!reviews_client_id_fkey(full_name, avatar_url), jobs(title)',
      )
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    return data ?? [];
  }
}
