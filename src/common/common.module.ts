import { Global, Module } from '@nestjs/common';
import { CommonService } from './services/common.service';

@Global()
@Module({
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
