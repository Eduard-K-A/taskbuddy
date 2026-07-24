import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CalendarService } from './calendar.service';
import {
  CreateBookingDto,
  ListBookingsQueryDto,
  UpdateBookingDto,
} from './dto/calendar.dto';
import type { Profile } from '../common/types';

@Controller('calendar/bookings')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  list(@CurrentUser() user: Profile, @Query() query: ListBookingsQueryDto) {
    return this.calendarService.list(user, query);
  }

  @Post()
  @Roles('provider')
  create(@CurrentUser() user: Profile, @Body() dto: CreateBookingDto) {
    return this.calendarService.create(user, dto);
  }

  @Patch(':id')
  @Roles('provider')
  update(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.calendarService.update(user, id, dto);
  }
}
