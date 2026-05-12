import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/auth/password.service';

const prisma = new PrismaClient();
const passwordService = new PasswordService();

async function main() {
  const roleNames = ['ADMIN', 'FOUNDER', 'INVESTOR'] as const;

  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'ADMIN' }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { status: 'ACTIVE' },
    create: {
      email: 'admin@example.com',
      status: 'ACTIVE',
      passwordHash: await passwordService.hash('ChangeMe123!')
    }
  });

  if (!admin.passwordHash) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: await passwordService.hash('ChangeMe123!') }
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
