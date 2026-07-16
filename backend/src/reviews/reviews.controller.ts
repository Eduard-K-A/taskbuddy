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
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/reviews.dto';
import type { Profile } from '../common/types';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('jobs/:jobId/review')
  @Roles('client')
  create(
    @CurrentUser() user: Profile,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user, jobId, dto);
  }

  @Get('providers/:providerId/reviews')
  listForProvider(@Param('providerId', ParseUUIDPipe) providerId: string) {
    return this.reviewsService.listForProvider(providerId);
  }
}
