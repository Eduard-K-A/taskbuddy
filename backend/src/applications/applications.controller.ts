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
import { ApplicationsService } from './applications.service';
import { ApplyDto } from './dto/applications.dto';
import type { Profile } from '../common/types';

@Controller()
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId/applications')
  @Roles('provider')
  apply(
    @CurrentUser() user: Profile,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: ApplyDto,
  ) {
    return this.applicationsService.apply(user, jobId, dto);
  }

  @Get('jobs/:jobId/applications')
  @Roles('client')
  listForJob(
    @CurrentUser() user: Profile,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.applicationsService.listForJob(user, jobId);
  }

  @Get('applications/mine')
  @Roles('provider')
  mine(@CurrentUser() user: Profile) {
    return this.applicationsService.mine(user);
  }

  @Post('applications/:id/accept')
  @Roles('client')
  accept(@CurrentUser() user: Profile, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.accept(user, id);
  }

  @Post('applications/:id/reject')
  @Roles('client')
  reject(@CurrentUser() user: Profile, @Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.reject(user, id);
  }

  @Post('applications/:id/withdraw')
  @Roles('provider')
  withdraw(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.withdraw(user, id);
  }
}
