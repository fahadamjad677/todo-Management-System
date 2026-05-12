import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { PrismaClientOptions } from '@prisma/client/runtime/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    const adapter: PrismaClientOptions['adapter'] = new PrismaPg({
      connectionString: url,
    });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('App shut down');
  }
}
