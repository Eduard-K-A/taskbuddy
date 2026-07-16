import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Profile } from '../common/types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Profile =>
    context.switchToHttp().getRequest().user,
);
