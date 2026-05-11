import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

class Seeder {
  private prisma: PrismaClient;

  constructor() {
    const connectionString = process.env.DATABASE_URL!;
    const adapter = new PrismaPg(connectionString);
    this.prisma = new PrismaClient({ adapter });
  }

  async run() {
    console.log(' Seeding started...');

    //First Creating Department
    const superAdminDepartment = await this.prisma.department.upsert({
      where: { name: 'ADMINISTRATION' },
      update: {},
      create: {
        name: 'ADMINISTRATION',
      },
    });

    //Creating Role
    const superAdminRole = await this.prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
      },
    });

    //Creating User
    const superAdmin = await this.prisma.user.upsert({
      where: { email: 'admin123@gmail.com' },
      update: {},
      create: {
        name: 'admin123',
        email: 'admin123@gmail.com',
        roleId: superAdminRole.id,
        password: 'superadmin123',
      },
    });

    //Create UserDepartment
    await this.prisma.userDepartment.upsert({
      where: {
        userId_departmentId: {
          userId: superAdmin.id,
          departmentId: superAdminDepartment.id,
        },
      },
      update: {},
      create: {
        userId: superAdmin.id,
        departmentId: superAdminDepartment.id,
      },
    });
    console.log('Seeding completed');
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const seeder = new Seeder();

  try {
    await seeder.run();
  } catch (error) {
    console.error(error);
  } finally {
    await seeder.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
});
