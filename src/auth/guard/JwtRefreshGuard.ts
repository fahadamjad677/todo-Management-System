import { AuthGuard } from '@nestjs/passport';

export class jwtRefreshGuard extends AuthGuard('refreshStrategy') {}
