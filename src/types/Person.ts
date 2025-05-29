import { 
    PersonalDetails, 
    EmploymentDetails, 
    IncomeDetails, 
    ExpensesDetails, 
    Asset, 
    Liability } from "./FormModels";
  
  export interface Person {
    personalDetails: PersonalDetails;
    employmentDetails: EmploymentDetails[];
    incomeDetails: IncomeDetails[];
    expensesDetails: ExpensesDetails[];
    assets: Asset[];
    liabilities: Liability[];
  }
  