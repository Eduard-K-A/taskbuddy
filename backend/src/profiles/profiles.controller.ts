import { Body, Controller, Patch, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProfilesService } from './profiles.service';
import {
  SetAvailabilityDto,
  UpdateProfileDto,
  UpsertProviderProfileDto,
} from './dto/profiles.dto';
import type { Profile } from '../common/types';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Patch('me')
  updateProfile(@CurrentUser() user: Profile, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(user, dto);
  }

  @Put('me/provider')
  @Roles('provider')
  upsertProviderProfile(
    @CurrentUser() user: Profile,
    @Body() dto: UpsertProviderProfileDto,
  ) {
    return this.profilesService.upsertProviderProfile(user, dto);
  }

  @Patch('me/provider/availability')
  @Roles('provider')
  setAvailability(
    @CurrentUser() user: Profile,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.profilesService.setAvailability(user, dto);
  }
}
