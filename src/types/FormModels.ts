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
  family: FamilyDetails;
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
