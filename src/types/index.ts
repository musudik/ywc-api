// Common type definitions for the application

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// =====================
// USER MANAGEMENT TYPES
// =====================

export interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  coach_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: Date;
  updated_at: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  CLIENT = 'CLIENT',
  GUEST = 'GUEST'
}

export enum Permission {
  MANAGE_USERS = 'MANAGE_USERS',
  CREATE_COACHES = 'CREATE_COACHES',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_CLIENTS = 'MANAGE_CLIENTS',
  MANAGE_COACHES = 'MANAGE_COACHES',
  MANAGE_CONTENT = 'MANAGE_CONTENT',
  VIEW_REPORTS = 'VIEW_REPORTS',
  CREATE_CLIENTS = 'CREATE_CLIENTS',
  MANAGE_OWN_CLIENTS = 'MANAGE_OWN_CLIENTS',
  VIEW_CLIENT_DATA = 'VIEW_CLIENT_DATA',
  CREATE_REPORTS = 'CREATE_REPORTS',
  VIEW_OWN_DATA = 'VIEW_OWN_DATA',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  REQUEST_SERVICES = 'REQUEST_SERVICES',
  VIEW_PUBLIC_CONTENT = 'VIEW_PUBLIC_CONTENT'
}

// =====================
// SHARED FORM TYPES
// =====================

export type ApplicantType = 'PrimaryApplicant' | 'SecondaryApplicant';
export type EmploymentType = 'PrimaryEmployment' | 'SecondaryEmployment';
export type Relation = 'Spouse' | 'Child' | 'Parent' | 'Other';
export type LoanType =
  | 'PersonalLoan'
  | 'HomeLoan'
  | 'CarLoan'
  | 'BusinessLoan'
  | 'EducationLoan'
  | 'OtherLoan';

// =====================
// PERSONAL DETAILS SECTION
// =====================

export interface PersonalDetails {
  personal_id: string;
  user_id: string;
  coach_id: string;
  applicant_type: ApplicantType;
  salutation: string;
  first_name: string;
  last_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  email: string;
  phone: string;
  whatsapp: string;
  marital_status: string;
  birth_date: string; // ISO string
  birth_place: string;
  nationality: string;
  residence_permit: string;
  eu_citizen: boolean;
  tax_id: string;
  iban: string;
  housing: string;
  created_at: Date;
  updated_at: Date;
}

// =====================
// FAMILY MEMBERS SECTION
// =====================

export interface FamilyMember {
  family_member_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  relation: Relation;
  birth_date: string; // ISO string
  nationality: string;
  tax_id?: string;
  created_at: Date;
  updated_at: Date;
}

// =====================
// FORM CONFIGURATIONS SECTION
// =====================

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: any;
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  collapsible?: boolean;
  fields: FormField[];
}

export interface ConsentForm {
  enabled: boolean;
  title?: string;
  content?: string;
  required?: boolean;
  checkboxText?: string;
}

export interface FormDocument {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize?: number; // in MB
}

export interface FormConfiguration {
  id: string;
  config_id: string;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
  name: string;
  form_type: string;
  version: string;
  description?: string;
  is_active: boolean;
  sections: FormSection[];
  custom_fields: Record<string, any>;
  consent_form: ConsentForm;
  documents: FormDocument[];
  usage_count: number;
  last_used_at?: Date;
}

export interface CreateFormConfigurationRequest {
  name: string;
  form_type: string;
  version?: string;
  description?: string;
  is_active?: boolean;
  sections: FormSection[];
  custom_fields?: Record<string, any>;
  consent_form?: ConsentForm;
  documents?: FormDocument[];
}

export interface UpdateFormConfigurationRequest extends Partial<CreateFormConfigurationRequest> {
  config_id?: never; // Prevent updating config_id
  created_by_id?: never; // Prevent updating created_by_id
}

// =====================
// EMPLOYMENT DETAILS SECTION
// =====================

export interface EmploymentDetails {
  employment_id: string;
  user_id: string;
  employment_type: EmploymentType;
  occupation: string;
  contract_type: string;
  contract_duration: string;
  employer_name: string;
  employed_since: string; // ISO string
  created_at: Date;
  updated_at: Date;
}

// =====================
// INCOME DETAILS SECTION
// =====================

export interface IncomeDetails {
  income_id: string;
  user_id: string;
  gross_income: number;
  net_income: number;
  tax_class: string;
  tax_id: string;
  number_of_salaries: number;
  child_benefit: number;
  other_income: number;
  income_trade_business: number;
  income_self_employed_work: number;
  income_side_job: number;
  created_at: Date;
  updated_at: Date;
}

// =====================
// EXPENSES DETAILS SECTION
// =====================

export interface ExpensesDetails {
  expenses_id: string;
  user_id: string;
  cold_rent: number;
  electricity: number;
  living_expenses: number;
  gas: number;
  telecommunication: number;
  account_maintenance_fee: number;
  alimony: number;
  subscriptions: number;
  other_expenses: number;
  created_at: Date;
  updated_at: Date;
}

// =====================
// ASSETS SECTION
// =====================

export interface Asset {
  asset_id: string;
  user_id: string;
  real_estate: number;
  securities: number;
  bank_deposits: number;
  building_savings: number;
  insurance_values: number;
  other_assets: number;
  created_at: Date;
  updated_at: Date;
}

// =====================
// LIABILITIES SECTION
// =====================

export interface Liability {
  liability_id: string;
  user_id: string;
  loan_type: LoanType;
  loan_bank?: string;
  loan_amount?: number;
  loan_monthly_rate?: number;
  loan_interest?: number;
  created_at: Date;
  updated_at: Date;
}

// =====================
// PERSON AGGREGATE TYPE
// =====================

export interface Person {
  personalDetails: PersonalDetails;
  employmentDetails: EmploymentDetails[];
  incomeDetails: IncomeDetails[];
  expensesDetails: ExpensesDetails[];
  assets: Asset[];
  liabilities: Liability[];
  familyMembers: FamilyMember[];
}

// =====================
// JWT TOKEN TYPES
// =====================

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  coach_id?: string;
  iat?: number;
  exp?: number;
}

// =====================
// REQUEST TYPES
// =====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  coach_id?: string;
}

// =====================
// FORM SUBMISSIONS SECTION
// =====================

export type FormSubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'under_review';

export interface FormSubmissionData {
  id: string;
  form_config_id: string;
  user_id: string;
  form_data: Record<string, any>;
  status: FormSubmissionStatus;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FormSubmissionList {
  id: string;
  form_config_id: string;
  config_name: string;
  user_id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFormSubmissionRequest {
  form_config_id: string; // UUID or config_id from form_configurations table
  form_data: Record<string, any>;
  status?: FormSubmissionStatus;
}

export interface UpdateFormSubmissionRequest {
  form_data?: Record<string, any>;
  status?: FormSubmissionStatus;
  review_notes?: string;
} 