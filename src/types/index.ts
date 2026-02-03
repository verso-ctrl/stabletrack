// ============================================================================
// SUBSCRIPTION & BILLING TYPES
// ============================================================================

// Simple 3-tier system: Free, Basic, Advanced
// The only difference is the number of horses allowed
export type SubscriptionTier = 'FREE' | 'BASIC' | 'ADVANCED';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'PAUSED';

export interface TierLimits {
  maxHorses: number;
  maxBarns: number;
  storageGb: number;
  features: string[];
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    maxHorses: 3,
    maxBarns: 1,
    storageGb: 5,
    features: [
      'Up to 3 horses',
      'Horse profiles & photos',
      'Health records',
      'Calendar & scheduling',
      'Daily care logging',
      'Client management',
    ],
  },
  BASIC: {
    maxHorses: 15,
    maxBarns: 1,
    storageGb: 25,
    features: [
      'Up to 15 horses',
      'Everything in Free',
      'Priority email support',
    ],
  },
  ADVANCED: {
    maxHorses: -1, // unlimited
    maxBarns: 1,
    storageGb: 100,
    features: [
      'Unlimited horses',
      'Everything in Basic',
      'Priority support',
    ],
  },
};

export const TIER_PRICING: Record<SubscriptionTier, number> = {
  FREE: 0,
  BASIC: 1900, // $19.00
  ADVANCED: 3900, // $39.00
};

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  maxHorses: number;
  maxBarns: number;
  storageGb: number;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  addOns: SubscriptionAddOn[];
}

// AddOnType kept for backward compatibility (no add-ons in simplified tier system)
export type AddOnType = 'EXTRA_STORAGE' | 'ADDITIONAL_USERS';

export interface SubscriptionAddOn {
  id: string;
  type: AddOnType;
  active: boolean;
  pricePerMonth: number;
  activatedAt: Date;
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  subscription: Subscription | null;
}

// ============================================================================
// BARN & TEAM TYPES
// ============================================================================

export type BarnRole = 'OWNER' | 'MANAGER' | 'TRAINER' | 'CARETAKER' | 'CLIENT';

export const ROLE_PERMISSIONS: Record<BarnRole, string[]> = {
  OWNER: ['*'], // All permissions
  MANAGER: [
    'horses:read', 'horses:write', 'horses:delete',
    'health:read', 'health:write',
    'events:read', 'events:write', 'events:delete',
    'tasks:read', 'tasks:write', 'tasks:assign',
    'team:read', 'team:write', 'team:invite',
    'clients:read', 'clients:write',
    'billing:read', 'billing:write',
    'reports:read',
    'settings:read',
    'documents:read', 'documents:write',
    'feed:read', 'feed:write',
    'training:read', 'training:write',
    'lessons:read', 'lessons:write',
    'competitions:read', 'competitions:write',
  ],
  TRAINER: [
    'horses:read',
    'health:read',
    'events:read', 'events:write',
    'tasks:read', 'tasks:write',
    'clients:read',
    'documents:read',
    'training:read', 'training:write',
    'lessons:read', 'lessons:write',
    'competitions:read', 'competitions:write',
  ],
  CARETAKER: [
    'horses:read', 'horses:write',
    'health:read', 'health:write',
    'events:read', 'events:write',
    'tasks:read', 'tasks:write',
    'feed:read', 'feed:write',
    'training:read', 'training:write',
    'lessons:read',
    'competitions:read',
    'documents:read',
  ],
  CLIENT: [
    'horses:read:own',
    'health:read:own',
    'events:read:own',
    'billing:read:own',
    'documents:read:own',
    'lessons:read:own',
    'competitions:read:own',
  ],
};

// Helper to check if a role has a permission
export function hasPermission(role: BarnRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (permissions.includes('*')) return true;
  if (permissions.includes(permission)) return true;
  
  // Check for :own suffix match (e.g., 'horses:read:own' grants 'horses:read' visibility)
  // This allows CLIENTs to see nav items but only access their own data
  const basePermission = permission.split(':').slice(0, 2).join(':');
  return permissions.some(p => p.startsWith(basePermission));
}

export interface Barn {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  inviteCode: string;
  logoUrl: string | null;
  primaryColor: string | null;
  timezone: string;
  createdAt: Date;
  memberCount?: number;
  horseCount?: number;
  // Subscription fields
  tier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface BarnMember {
  id: string;
  userId: string;
  barnId: string;
  role: BarnRole;
  joinedAt: Date;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

// ============================================================================
// HORSE TYPES
// ============================================================================

export type HorseStatus = 'ACTIVE' | 'LAYUP' | 'RETIRED' | 'SOLD' | 'DECEASED' | 'LEASED_OUT';
export type HorseSex = 'MARE' | 'GELDING' | 'STALLION' | 'COLT' | 'FILLY';

export interface Horse {
  id: string;
  barnId: string;
  barnName: string;
  registeredName: string | null;
  breed: string | null;
  color: string | null;
  markings: string | null;
  dateOfBirth: Date | null;
  sex: HorseSex | null;
  heightHands: number | null;
  microchipNumber: string | null;
  status: HorseStatus;
  statusNote: string | null;
  profilePhotoUrl: string | null;
  ownerName: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed/joined fields
  stallName?: string | null;
  currentWeight?: number | null;
  age?: number | null;
  activeMedicationCount?: number;
}

export interface HorseDetail extends Horse {
  feedProgram: FeedProgram | null;
  currentMedications: Medication[];
  recentHealthRecords: HealthRecord[];
  upcomingEvents: Event[];
  photos: HorsePhoto[];
  vaccinations?: Vaccination[];
  documents?: Document[];
  notes?: HorseNote[];
}

export interface HorseNote {
  id: string;
  content: string;
  createdAt: Date;
  author?: {
    firstName: string | null;
    lastName: string | null;
  };
}

export interface HorsePhoto {
  id: string;
  url: string;
  caption: string | null;
  category: string | null;
  takenAt: Date | null;
  uploadedAt: Date;
}

// ============================================================================
// FEED & CARE TYPES
// ============================================================================

export interface FeedType {
  id: string;
  name: string;
  brand: string | null;
  category: 'grain' | 'hay' | 'supplement' | 'other';
  unit: string;
  costPerUnit: number | null;
}

export interface Supplement {
  id: string;
  name: string;
  brand: string | null;
  unit: string;
  costPerUnit: number | null;
}

export interface FeedProgram {
  id: string;
  horseId: string;
  name: string | null;
  instructions: string | null;
  dailyCostEstimate: number | null;
  items: FeedProgramItem[];
}

export interface FeedProgramItem {
  id: string;
  feedType?: FeedType;
  supplement?: Supplement;
  amount: number;
  unit: string;
  feedingTime: 'AM' | 'PM' | 'MIDDAY' | 'ALL';
}

// ============================================================================
// HEALTH & MEDICAL TYPES
// ============================================================================

export type VaccinationType =
  | 'RABIES'
  | 'EWT_EEE_WEE_TETANUS'
  | 'FLU_RHINO'
  | 'WEST_NILE'
  | 'STRANGLES'
  | 'POTOMAC_HORSE_FEVER'
  | 'BOTULISM'
  | 'ROTAVIRUS'
  | 'OTHER';

export interface Vaccination {
  id: string;
  horseId: string;
  type: VaccinationType;
  customName: string | null;
  dateGiven: Date;
  nextDueDate: Date | null;
  veterinarian: string | null;
  lotNumber: string | null;
  manufacturer: string | null;
  notes: string | null;
}

export type MedicationStatus = 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';

export interface Medication {
  id: string;
  horseId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string | null;
  prescribedBy: string | null;
  startDate: Date;
  endDate: Date | null;
  status: MedicationStatus;
  isControlled: boolean;
  instructions: string | null;
  refillsRemaining: number | null;
}

export type HealthRecordType =
  | 'VET_VISIT'
  | 'COGGINS'
  | 'DENTAL'
  | 'CHIROPRACTIC'
  | 'ACUPUNCTURE'
  | 'MASSAGE'
  | 'INJURY'
  | 'ILLNESS'
  | 'SURGERY'
  | 'LAB_WORK'
  | 'IMAGING'
  | 'OTHER';

export interface HealthRecord {
  id: string;
  horseId: string;
  type: HealthRecordType;
  date: Date;
  provider: string | null;
  practice: string | null;
  diagnosis: string | null;
  treatment: string | null;
  findings: string | null;
  followUpDate: Date | null;
  cost: number | null;
  cogginsExpiry: Date | null;
  notes: string | null;
  attachments: HealthAttachment[];
}

export interface HealthAttachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  description: string | null;
}

export interface WeightRecord {
  id: string;
  horseId: string;
  weight: number;
  bodyScore: number | null;
  date: Date;
  notes: string | null;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type EventType =
  | 'FARRIER'
  | 'DEWORMING'
  | 'VACCINATION'
  | 'VET_APPOINTMENT'
  | 'DENTAL'
  | 'TRAINING'
  | 'SHOW'
  | 'TRANSPORT'
  | 'BREEDING'
  | 'OTHER';

export type EventStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'RESCHEDULED';

export interface Event {
  id: string;
  barnId: string;
  horseId: string | null;
  type: EventType;
  customType: string | null;
  title: string;
  description: string | null;
  scheduledDate: Date;
  completedDate: Date | null;
  status: EventStatus;
  providerName: string | null;
  providerPhone: string | null;
  farrierWork: string | null;
  dewormProduct: string | null;
  cost: number | null;
  notes: string | null;
  isRecurring: boolean;
  horse?: {
    barnName: string;
    profilePhotoUrl: string | null;
  };
}

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface Task {
  id: string;
  barnId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  dueTime: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  isRecurring: boolean;
  completedAt: Date | null;
  assignee?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentType =
  | 'REGISTRATION'
  | 'COGGINS'
  | 'HEALTH_CERTIFICATE'
  | 'INSURANCE'
  | 'PURCHASE_AGREEMENT'
  | 'LEASE'
  | 'VET_RECORDS'
  | 'TRAINING_CERTIFICATE'
  | 'OTHER';

export interface Document {
  id: string;
  horseId: string;
  type: DocumentType;
  title: string;
  description: string | null;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiryDate: Date | null;
  uploadedAt: Date;
}

// ============================================================================
// ACTIVITY & ALERTS
// ============================================================================

export type ActivityType =
  | 'HORSE_CREATED'
  | 'HORSE_UPDATED'
  | 'HORSE_DELETED'
  | 'HEALTH_RECORD_ADDED'
  | 'EVENT_CREATED'
  | 'EVENT_COMPLETED'
  | 'MEDICATION_GIVEN'
  | 'FEED_LOGGED'
  | 'TASK_COMPLETED'
  | 'MEMBER_JOINED'
  | 'MEMBER_LEFT'
  | 'SETTINGS_CHANGED';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  user?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

export interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  horseId?: string;
  horseName?: string;
  actionUrl?: string;
  expiresAt?: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateHorseInput {
  barnName: string;
  registeredName?: string;
  breed?: string;
  color?: string;
  dateOfBirth?: Date;
  sex?: HorseSex;
  heightHands?: number;
  microchipNumber?: string;
  status?: HorseStatus;
  ownerName?: string;
}

export interface UpdateHorseInput extends Partial<CreateHorseInput> {
  id: string;
}

export interface CreateEventInput {
  horseId?: string;
  type: EventType;
  customType?: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  providerName?: string;
  providerPhone?: string;
  farrierWork?: string;
  dewormProduct?: string;
  cost?: number;
  notes?: string;
  isRecurring?: boolean;
  recurringRule?: string;
}

export interface CreateHealthRecordInput {
  horseId: string;
  type: HealthRecordType;
  date: Date;
  provider?: string;
  practice?: string;
  diagnosis?: string;
  treatment?: string;
  findings?: string;
  followUpDate?: Date;
  cost?: number;
  cogginsExpiry?: Date;
  notes?: string;
}
