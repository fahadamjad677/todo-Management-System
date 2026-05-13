import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadUser } from '../../auth/types';

export const GetUser = createParamDecorator(
  (data: keyof PayloadUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as PayloadUser;

    return data ? user?.[data] : user;
  },
);
