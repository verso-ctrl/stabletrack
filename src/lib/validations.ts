import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  phone: z.string().optional(),
});

// Horse validation schemas
export const horseSchema = z.object({
  barnName: z.string().min(1, 'Barn name is required').max(100, 'Barn name is too long'),
  registeredName: z.string().max(100, 'Registered name is too long').optional(),
  breed: z.string().max(50, 'Breed is too long').optional(),
  color: z.string().max(50, 'Color is too long').optional(),
  sex: z.enum(['MARE', 'GELDING', 'STALLION', 'FILLY', 'COLT']).optional(),
  dateOfBirth: z.string().optional(),
  height: z.number().positive('Height must be positive').optional(),
  weight: z.number().positive('Weight must be positive').optional(),
  microchipNumber: z.string().max(50, 'Microchip number is too long').optional(),
  passportNumber: z.string().max(50, 'Passport number is too long').optional(),
  coggins: z.string().max(50, 'Coggins is too long').optional(),
  cogginsExpiry: z.string().optional(),
  status: z.enum(['ACTIVE', 'LAYUP', 'RETIRED', 'SOLD', 'DECEASED', 'LEASED_OUT', 'RETURNED_TO_OWNER']).optional(),
  ownerId: z.string().optional(),
  notes: z.string().optional(),
});

// Event validation schemas
export const eventSchema = z.object({
  type: z.enum(['FARRIER', 'DEWORMING', 'VACCINATION', 'VET_APPOINTMENT', 'DENTAL', 'TRAINING', 'SHOW', 'TRANSPORT', 'BREEDING', 'OTHER']),
  customType: z.string().max(50, 'Custom type is too long').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  horseIds: z.array(z.string()).optional(),
  horseId: z.string().optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  providerName: z.string().max(100, 'Provider name is too long').optional(),
  providerPhone: z.string().max(20, 'Provider phone is too long').optional(),
  farrierWork: z.string().optional(),
  dewormProduct: z.string().max(100, 'Deworm product is too long').optional(),
  cost: z.number().nonnegative('Cost cannot be negative').optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringRule: z.string().optional(),
});

// Health record validation schemas
export const healthRecordSchema = z.object({
  type: z.enum(['VET_VISIT', 'VACCINATION', 'DEWORMING', 'DENTAL', 'FARRIER', 'INJURY', 'ILLNESS', 'SURGERY', 'OTHER']),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  veterinarian: z.string().max(100, 'Veterinarian name is too long').optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medications: z.string().optional(),
  cost: z.number().nonnegative('Cost cannot be negative').optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

// Lesson validation schemas
export const lessonSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(100, 'Student name is too long'),
  studentEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  horseId: z.string().min(1, 'Horse selection is required'),
  instructorId: z.string().optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  duration: z.number().int().positive('Duration must be a positive number'),
  type: z.enum(['PRIVATE', 'GROUP', 'SEMI_PRIVATE']),
  discipline: z.string().max(50, 'Discipline is too long').optional(),
  price: z.number().nonnegative('Price cannot be negative').optional(),
  notes: z.string().optional(),
});

// Competition validation schemas
export const competitionSchema = z.object({
  name: z.string().min(1, 'Competition name is required').max(200, 'Competition name is too long'),
  location: z.string().min(1, 'Location is required').max(200, 'Location is too long'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }),
  horseIds: z.array(z.string()).min(1, 'At least one horse must be selected'),
  discipline: z.string().max(50, 'Discipline is too long').optional(),
  level: z.string().max(50, 'Level is too long').optional(),
  entryFee: z.number().nonnegative('Entry fee cannot be negative').optional(),
  notes: z.string().optional(),
});

// Training session validation schemas
export const trainingSessionSchema = z.object({
  horseId: z.string().min(1, 'Horse selection is required'),
  trainerId: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  duration: z.number().int().positive('Duration must be a positive number'),
  type: z.string().max(50, 'Type is too long').optional(),
  focus: z.string().optional(),
  accomplishments: z.string().optional(),
  challenges: z.string().optional(),
  nextSteps: z.string().optional(),
  notes: z.string().optional(),
});

// Barn validation schemas
export const barnSchema = z.object({
  name: z.string().min(1, 'Barn name is required').max(100, 'Barn name is too long'),
  address: z.string().max(200, 'Address is too long').optional(),
  city: z.string().max(100, 'City is too long').optional(),
  state: z.string().max(50, 'State is too long').optional(),
  zipCode: z.string().max(20, 'Zip code is too long').optional(),
  phone: z.string().max(20, 'Phone is too long').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// Client validation schemas
export const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20, 'Phone is too long').optional(),
  address: z.string().max(200, 'Address is too long').optional(),
  emergencyContact: z.string().max(100, 'Emergency contact is too long').optional(),
  emergencyPhone: z.string().max(20, 'Emergency phone is too long').optional(),
  notes: z.string().optional(),
});

// Barn member validation schemas
export const barnMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['OWNER', 'MANAGER', 'TRAINER', 'CARETAKER', 'CLIENT']),
});

// Invoice validation schemas
export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client selection is required'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid due date format',
  }),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  })).min(1, 'At least one item is required'),
});

// Helper function to validate data
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

// Helper function to format validation errors
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
}
