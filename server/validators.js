import { z } from 'zod';

export const propertyValidationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(2, 'Category is required'),
  state: z.string().default('Andhra Pradesh'),
  city: z.string().default('Guntur'),
  area: z.string().default('Brodipet'),
  areaSqFt: z.string().optional(),
  bedrooms: z.number().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
});

export const franchiseValidationSchema = z.object({
  brand: z.string().min(2, 'Brand name is required'),
  type: z.string().min(2, 'Franchise type is required'),
  investment: z.number().positive('Investment must be positive'),
  city: z.string().min(2, 'City is required'),
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
  customerName: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  listingTitle: z.string().min(2, 'Listing title is required'),
});
