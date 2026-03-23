import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    const heartbeat = await prisma.runtimeHeartbeat.create({
      data: {
        service: process.env.RUNTIME_HEARTBEAT_SERVICE ?? 'bootstrap-local',
        startedAt: process.env.RUNTIME_HEARTBEAT_STARTED_AT
          ? new Date(process.env.RUNTIME_HEARTBEAT_STARTED_AT)
          : new Date(),
      },
    });

    console.log(
      `Seeded runtime heartbeat ${heartbeat.id} for service ${heartbeat.service}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
