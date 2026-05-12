import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { PasswordService } from '../src/auth/password.service';

loadEnv();

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

  const founderRole = await prisma.role.findUniqueOrThrow({ where: { name: 'FOUNDER' } });
  const investorRole = await prisma.role.findUniqueOrThrow({ where: { name: 'INVESTOR' } });
  const founder = await upsertDemoUser('founder@example.com', founderRole.id);
  const investor = await upsertDemoUser('investor@example.com', investorRole.id);

  await prisma.founderProfile.upsert({
    where: { userId: founder.id },
    update: {},
    create: {
      userId: founder.id,
      fullName: 'Demo Founder',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      role: 'CEO',
      biography: 'Demo founder profile for MVP testing.'
    }
  });

  const company = await prisma.company.upsert({
    where: { id: 'demo-company-novasphere' },
    update: {},
    create: {
      id: 'demo-company-novasphere',
      name: 'NovaSphere AI',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      sector: 'AI',
      businessModel: 'B2B SaaS Subscription',
      stage: 'Seed',
      status: 'APPROVED',
      visibility: 'INVESTORS',
      website: 'https://www.novasphere.ai',
      description: 'Enterprise intelligence platform for AI-assisted reporting, forecasting, and operational decisions.',
      problem: 'Business data is fragmented and hard to turn into real-time decisions.',
      solution: 'AI copilots and automated dashboards convert operating data into recommendations.',
      targetCustomers: 'Startups, SMEs, venture capital firms, and enterprise teams.',
      members: { create: { userId: founder.id, name: 'Demo Founder', role: 'Founder' } }
    }
  });

  await prisma.companyMetric.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      customerCount: 18,
      payingCustomerCount: 8,
      monthlyRecurringRevenue: 32000,
      annualRecurringRevenue: 384000,
      annualRevenue: 420000,
      revenueGrowthRate: 18,
      grossMargin: 72,
      burnRate: 55000,
      runwayMonths: 11,
      currency: 'MYR'
    }
  });

  await prisma.fundraisingRound.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      amountRaising: 1500000,
      claimedValuation: 9000000,
      currency: 'MYR',
      instrument: 'SAFE',
      previousFunding: 250000,
      useOfFunds: 'Product development, sales hiring, and regional market expansion.',
      currentInvestors: 'Demo angel investors'
    }
  });

  await prisma.investorProfile.upsert({
    where: { userId: investor.id },
    update: {},
    create: {
      userId: investor.id,
      fullName: 'Demo Investor',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      title: 'Partner',
      bio: 'Demo investor profile for marketplace testing.'
    }
  });

  const organization = await prisma.organization.upsert({
    where: { id: 'demo-organization-sea-ventures' },
    update: {},
    create: {
      id: 'demo-organization-sea-ventures',
      name: 'SEA Ventures',
      type: 'VC',
      status: 'ACTIVE',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      website: 'https://example.com',
      description: 'Demo VC organization focused on early-stage Southeast Asia software companies.',
      members: { create: { userId: investor.id, role: 'OWNER' } }
    }
  });

  const investorProfile = await prisma.investorProfile.update({
    where: { userId: investor.id },
    data: { organizationId: organization.id }
  });

  await prisma.investorPreference.upsert({
    where: { investorProfileId: investorProfile.id },
    update: {},
    create: {
      investorProfileId: investorProfile.id,
      organizationId: organization.id,
      thesis: 'Seed-stage AI, SaaS, fintech, and automation companies in Southeast Asia.',
      sectors: ['AI', 'SaaS'],
      stages: ['Seed', 'Pre-seed'],
      geographies: ['Malaysia', 'Singapore'],
      minTicketSize: 250000,
      maxTicketSize: 2000000,
      riskPreference: 'Balanced',
      leadPreference: 'Lead or co-lead'
    }
  });
}

async function upsertDemoUser(email: string, roleId: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { status: 'ACTIVE' },
    create: {
      email,
      status: 'ACTIVE',
      passwordHash: await passwordService.hash('ChangeMe123!')
    }
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId } },
    update: {},
    create: { userId: user.id, roleId }
  });
  return user;
}

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    process.env[key] = process.env[key] ?? value;
  }
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
