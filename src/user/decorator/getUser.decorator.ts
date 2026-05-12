import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadUser } from '../../auth/types';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: keyof PayloadUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return data ? request.user?.[data] : request.user;
  },
);
