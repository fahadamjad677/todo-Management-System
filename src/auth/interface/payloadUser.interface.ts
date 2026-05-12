// src/types/express.d.ts

import { PayloadUser } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: PayloadUser;
  }
}

export {};
