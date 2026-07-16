import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { RecommendationsService } from './recommendations.service';
import type { Profile } from '../common/types';

@Controller()
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('jobs/:jobId/recommendations/trigger')
  @Roles('client')
  trigger(
    @CurrentUser() user: Profile,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.recommendationsService.triggerManual(user, jobId);
  }
}
