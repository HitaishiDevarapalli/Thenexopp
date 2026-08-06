import { z } from 'zod';

export const propertyValidationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  category: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  areaSqFt: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
});

export const franchiseValidationSchema = z.object({
  brand: z.string().optional(),
  type: z.string().optional(),
  investment: z.coerce.number().optional(),
  city: z.string().optional(),
});

export const userRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'PROPERTY_EDITOR', 'FRANCHISE_EDITOR', 'USER']).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const enquirySchema = z.object({
  customerName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  listingTitle: z.string().optional(),
});
