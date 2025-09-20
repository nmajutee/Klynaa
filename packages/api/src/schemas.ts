import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['customer', 'worker', 'admin']),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['customer', 'worker']),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Bin schemas
export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
});

export const binSchema = z.object({
  id: z.string(),
  type: z.enum(['general', 'recyclable', 'organic', 'hazardous']),
  location: locationSchema,
  capacity: z.number().positive(),
  currentLevel: z.number().min(0).max(100),
  status: z.enum(['active', 'inactive', 'full', 'maintenance']),
  lastEmptied: z.string().optional(),
  qrCode: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createBinSchema = z.object({
  type: z.enum(['general', 'recyclable', 'organic', 'hazardous']),
  location: locationSchema,
  capacity: z.number().positive('Capacity must be positive'),
});

// Pickup schemas
export const pickupSchema = z.object({
  id: z.string(),
  bin: binSchema,
  worker: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
  }).optional(),
  customer: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
  }).optional(),
  status: z.enum(['scheduled', 'assigned', 'in_progress', 'completed', 'cancelled']),
  scheduledTime: z.string(),
  completedTime: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedDuration: z.number().positive(),
  actualDuration: z.number().positive().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPickupSchema = z.object({
  binId: z.string().min(1, 'Bin ID is required'),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().optional(),
  estimatedDuration: z.number().positive().default(30),
});

// Export types
export type User = z.infer<typeof userSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Bin = z.infer<typeof binSchema>;
export type CreateBin = z.infer<typeof createBinSchema>;
export type Pickup = z.infer<typeof pickupSchema>;
export type CreatePickup = z.infer<typeof createPickupSchema>;