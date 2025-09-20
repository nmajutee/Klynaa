import { z } from 'zod';

// Environment configuration schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().url().default('http://localhost:8000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// API endpoints configuration
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
  },
  bins: {
    list: '/api/bins',
    detail: (id: string) => `/api/bins/${id}`,
    create: '/api/bins',
    update: (id: string) => `/api/bins/${id}`,
    delete: (id: string) => `/api/bins/${id}`,
  },
  pickups: {
    list: '/api/pickups',
    detail: (id: string) => `/api/pickups/${id}`,
    create: '/api/pickups',
    schedule: '/api/pickups/schedule',
    track: (id: string) => `/api/pickups/${id}/track`,
  },
  workers: {
    list: '/api/workers',
    detail: (id: string) => `/api/workers/${id}`,
    routes: (id: string) => `/api/workers/${id}/routes`,
  },
} as const;

// App configuration
export const appConfig = {
  name: 'Klynaa',
  description: 'Enterprise Waste Management Platform',
  version: '1.0.0',
  support: {
    email: 'support@klynaa.com',
    phone: '+1-800-KLYNAA',
  },
  features: {
    analytics: true,
    realTimeTracking: true,
    aiOptimization: true,
    blockchain: true,
  },
} as const;

// Validate environment variables
export function validateEnv(env: Record<string, unknown>): Env {
  return envSchema.parse(env);
}