import { z } from 'zod';

export const dependencyDescriptorSchema = z.object({
  name: z.enum(['postgres', 'redis']),
  url: z.string().url(),
  state: z.enum(['configured', 'placeholder']),
});

export const serviceRuntimeDescriptorSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  startupMessage: z.string().min(1),
  dependencies: z.array(dependencyDescriptorSchema).min(1),
});

export const serviceHeartbeatSchema = z.object({
  service: z.string().min(1),
  startedAt: z.string().datetime(),
  dependencies: z.array(z.enum(['postgres', 'redis'])).min(1),
});

export const runtimeEnvironmentSchema = z.object({
  PORT: z.coerce.number().int().min(0).default(3010),
  POSTGRES_URL: z.string().url(),
  REDIS_URL: z.string().url(),
});
