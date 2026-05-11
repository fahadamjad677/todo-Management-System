import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configservice: ConfigService) {
    const URL = configservice.get<string>('DATABASE_URL');
    const adapter = new PrismaPg({ connectionString: URL });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database Connected Successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database Disconnected Sucessfully');
  }
}
