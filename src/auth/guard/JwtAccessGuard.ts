import { AuthGuard } from '@nestjs/passport';

export class jwtAcessGuard extends AuthGuard('accessStrategy') {}
