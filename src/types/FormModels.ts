// =====================
// Shared Types
// =====================

export type ApplicantType = 'PrimaryApplicant' | 'SecondaryApplicant';
export type EmploymentType = 'PrimaryEmployment' | 'SecondaryEmployment';
export type LoanType =
  | 'PersonalLoan'
  | 'HomeLoan'
  | 'CarLoan'
  | 'BusinessLoan'
  | 'EducationLoan'
  | 'OtherLoan';
export type Relation = 'Spouse' | 'Child' | 'Parent' | 'Other';

// =====================
// Form Document Types
// =====================

export type DocumentUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'deleted';

export interface FormDocument {
  id: string;
  form_submission_id: string;
  client_id: string;
  form_config_id: string;
  file_name: string;
  applicant_type: string;
  document_id: string;
  firebase_path: string;
  upload_status: DocumentUploadStatus;
  uploaded_at: string; // ISO string
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface CreateFormDocumentData {
  form_submission_id: string;
  client_id: string;
  form_config_id: string;
  file_name: string;
  applicant_type: string;
  document_id: string;
  firebase_path: string;
  upload_status?: DocumentUploadStatus;
  uploaded_at?: string; // ISO string
}

export interface UpdateFormDocumentData {
  file_name?: string;
  upload_status?: DocumentUploadStatus;
  firebase_path?: string;
  uploaded_at?: string; // ISO string
}

export interface DocumentStatusResponse {
  form_submission_id: string;
  documents: FormDocument[];
  total_documents: number;
  uploaded_count: number;
  pending_count: number;
  failed_count: number;
}

// =====================
// Personal Details
// =====================

export interface Children {
  firstName: string;
  lastName: string;
  birthDate: string; // ISO string
  nationality: string;
}

export interface FamilyDetails {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  children: Children[];
}

export interface FamilyMember {
  firstName: string;
  lastName: string;
  relation: Relation;
  birthDate: string; // ISO string
  nationality: string;
  taxId: string;
  personalId: string;
}

export interface PersonalDetails {
  coachId: string;
  personalId: string;
  applicantType: ApplicantType;
  salutation: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  whatsapp: string;
  maritalStatus: string;
  birthDate: string; // ISO string
  birthPlace: string;
  nationality: string;
  residencePermit: string;
  euCitizen: boolean;
  taxId: string;
  IBAN: string;
  housing: string;
  family: FamilyMember[];
}

// =====================
// Employment Details
// =====================

export interface EmploymentDetails {
  employmentId: string;
  personalId: string;
  employmentType: EmploymentType;
  occupation: string;
  contractType: string;
  contractDuration: string;
  employerName: string;
  employedSince: string; // ISO string
}

// =====================
// Income Details
// =====================

export interface IncomeDetails {
  incomeId: string;
  personalId: string;
  grossIncome: number;
  netIncome: number;
  taxClass: string;
  taxId: string;
  numberOfSalaries: number;
  childBenefit: number;
  otherIncome: number;
  incomeTradeBusiness: number;
  incomeSelfEmployedWork: number;
  incomeSideJob: number;
}

// =====================
// Expenses Details
// =====================

export interface ExpensesDetails {
  expensesId: string;
  personalId: string;
  coldRent: number;
  electricity: number;
  livingExpenses: number;
  gas: number;
  telecommunication: number;
  accountMaintenanceFee: number;
  alimony: number;
  subscriptions: number;
  otherExpenses: number;
}

// =====================
// Asset
// =====================

export interface Asset {
  assetId: string;
  personalId: string;
  realEstate: number;
  securities: number;
  bankDeposits: number;
  buildingSavings: number;
  insuranceValues: number;
  otherAssets: number;
}

// =====================
// Liability
// =====================

export interface Liability {
  liabilityId: string;
  personalId: string;
  loanType: LoanType;
  loanBank?: string;
  loanAmount?: number;
  loanMonthlyRate?: number;
  loanInterest?: number;
}
