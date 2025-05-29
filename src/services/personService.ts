import { pool } from '../config/db';
import { Person, PersonalDetails, EmploymentDetails, IncomeDetails, ExpensesDetails, Asset, Liability, FamilyMember } from '../types';
import { PersonalDetailsService } from './personalDetailsService';
import { EmploymentService } from './employmentService';
import { IncomeService } from './incomeService';
import { ExpensesService } from './expensesService';
import { AssetService } from './assetService';
import { LiabilityService } from './liabilityService';
import { FamilyMemberService } from './familyMemberService';

export class PersonService {
  private personalDetailsService = new PersonalDetailsService();
  private employmentService = new EmploymentService();
  private incomeService = new IncomeService();
  private expensesService = new ExpensesService();
  private assetService = new AssetService();
  private liabilityService = new LiabilityService();
  private familyMemberService = new FamilyMemberService();

  // Get complete person profile by user_id
  async getCompletePersonProfile(userId: string): Promise<Person | null> {
    try {
      // Get personal details
      const personalDetails = await this.personalDetailsService.getPersonalDetailsByUserId(userId);
      
      if (!personalDetails) {
        return null;
      }

      // Get all related data in parallel
      const [
        employmentDetails,
        incomeDetails,
        expensesDetails,
        assets,
        liabilities,
        familyMembers
      ] = await Promise.all([
        this.employmentService.getEmploymentDetailsByUserId(userId),
        this.incomeService.getIncomeDetailsByUserId(userId),
        this.expensesService.getExpensesDetailsByUserId(userId),
        this.assetService.getAssetsByUserId(userId),
        this.liabilityService.getLiabilitiesByUserId(userId),
        this.familyMemberService.getFamilyMembersByUserId(userId)
      ]);

      const person: Person = {
        personalDetails,
        employmentDetails,
        incomeDetails,
        expensesDetails,
        assets,
        liabilities,
        familyMembers
      };

      return person;
    } catch (error: any) {
      console.error('Error fetching complete person profile:', error);
      throw new Error(`Failed to fetch complete person profile: ${error.message}`);
    }
  }

  // Get person profile by personal_id (for backward compatibility)
  async getCompletePersonProfileByPersonalId(personalId: string): Promise<Person | null> {
    try {
      // First get personal details to get the user_id
      const personalDetails = await this.personalDetailsService.getPersonalDetailsById(personalId);
      
      if (!personalDetails) {
        return null;
      }

      // Now get the complete profile using user_id
      return await this.getCompletePersonProfile(personalDetails.user_id);
    } catch (error: any) {
      console.error('Error fetching complete person profile by personal ID:', error);
      throw new Error(`Failed to fetch complete person profile: ${error.message}`);
    }
  }

  // Get person profile summary (basic info for listings)
  async getPersonSummary(userId: string) {
    try {
      const query = `
        SELECT 
          pd.personal_id,
          pd.user_id,
          pd.first_name,
          pd.last_name,
          pd.email,
          pd.applicant_type,
          pd.birth_date,
          pd.nationality,
          pd.created_at,
          u.first_name || ' ' || u.last_name as coach_name,
          COUNT(DISTINCT ed.employment_id) as employment_count,
          COUNT(DISTINCT id.income_id) as income_count,
          COUNT(DISTINCT ex.expenses_id) as expenses_count,
          COUNT(DISTINCT a.asset_id) as assets_count,
          COUNT(DISTINCT l.liability_id) as liabilities_count
        FROM personal_details pd
        LEFT JOIN users u ON pd.coach_id = u.id
        LEFT JOIN employment_details ed ON pd.user_id = ed.user_id
        LEFT JOIN income_details id ON pd.user_id = id.user_id
        LEFT JOIN expenses_details ex ON pd.user_id = ex.user_id
        LEFT JOIN assets a ON pd.user_id = a.user_id
        LEFT JOIN liabilities l ON pd.user_id = l.user_id
        WHERE pd.user_id = $1
        GROUP BY pd.personal_id, pd.user_id, u.first_name, u.last_name
      `;

      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error: any) {
      console.error('Error fetching person summary:', error);
      throw new Error(`Failed to fetch person summary: ${error.message}`);
    }
  }

  // Get all persons summary (for coach dashboard)
  async getAllPersonsSummary(coachId?: string) {
    try {
      let query = `
        SELECT 
          pd.personal_id,
          pd.user_id,
          pd.first_name,
          pd.last_name,
          pd.email,
          pd.applicant_type,
          pd.birth_date,
          pd.nationality,
          pd.created_at,
          u.first_name || ' ' || u.last_name as coach_name,
          COUNT(DISTINCT ed.employment_id) as employment_count,
          COUNT(DISTINCT id.income_id) as income_count,
          COUNT(DISTINCT ex.expenses_id) as expenses_count,
          COUNT(DISTINCT a.asset_id) as assets_count,
          COUNT(DISTINCT l.liability_id) as liabilities_count
        FROM personal_details pd
        LEFT JOIN users u ON pd.coach_id = u.id
        LEFT JOIN employment_details ed ON pd.user_id = ed.user_id
        LEFT JOIN income_details id ON pd.user_id = id.user_id
        LEFT JOIN expenses_details ex ON pd.user_id = ex.user_id
        LEFT JOIN assets a ON pd.user_id = a.user_id
        LEFT JOIN liabilities l ON pd.user_id = l.user_id
      `;

      const values: any[] = [];
      
      if (coachId) {
        query += ' WHERE pd.coach_id = $1';
        values.push(coachId);
      }

      query += ' GROUP BY pd.personal_id, pd.user_id, u.first_name, u.last_name ORDER BY pd.created_at DESC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error: any) {
      console.error('Error fetching all persons summary:', error);
      throw new Error(`Failed to fetch all persons summary: ${error.message}`);
    }
  }

  // Calculate financial summary for a person
  async getFinancialSummary(userId: string) {
    try {
      const query = `
        SELECT 
          -- Income totals
          COALESCE(SUM(id.gross_income), 0) as total_gross_income,
          COALESCE(SUM(id.net_income), 0) as total_net_income,
          COALESCE(SUM(id.child_benefit + id.other_income + id.income_trade_business + 
                      id.income_self_employed_work + id.income_side_job), 0) as total_additional_income,
          
          -- Expense totals
          COALESCE(SUM(ex.cold_rent + ex.electricity + ex.living_expenses + ex.gas + 
                      ex.telecommunication + ex.account_maintenance_fee + ex.alimony + 
                      ex.subscriptions + ex.other_expenses), 0) as total_expenses,
          
          -- Asset totals
          COALESCE(SUM(a.real_estate + a.securities + a.bank_deposits + 
                      a.building_savings + a.insurance_values + a.other_assets), 0) as total_assets,
          
          -- Liability totals
          COALESCE(SUM(l.loan_amount), 0) as total_loan_amount,
          COALESCE(SUM(l.loan_monthly_rate), 0) as total_monthly_payments
          
        FROM users u
        LEFT JOIN income_details id ON u.id = id.user_id
        LEFT JOIN expenses_details ex ON u.id = ex.user_id
        LEFT JOIN assets a ON u.id = a.user_id
        LEFT JOIN liabilities l ON u.id = l.user_id
        WHERE u.id = $1
        GROUP BY u.id
      `;

      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return {
          total_gross_income: 0,
          total_net_income: 0,
          total_additional_income: 0,
          total_expenses: 0,
          total_assets: 0,
          total_loan_amount: 0,
          total_monthly_payments: 0,
          net_monthly_cash_flow: 0,
          net_worth: 0
        };
      }

      const summary = result.rows[0];
      
      // Calculate derived values
      summary.net_monthly_cash_flow = parseFloat(summary.total_net_income) + parseFloat(summary.total_additional_income) 
                                    - parseFloat(summary.total_expenses) - parseFloat(summary.total_monthly_payments);
      summary.net_worth = parseFloat(summary.total_assets) - parseFloat(summary.total_loan_amount);

      // Convert all to numbers
      Object.keys(summary).forEach(key => {
        summary[key] = parseFloat(summary[key]) || 0;
      });

      return summary;
    } catch (error: any) {
      console.error('Error calculating financial summary:', error);
      throw new Error(`Failed to calculate financial summary: ${error.message}`);
    }
  }

  // Get users by role
  async getUsersByRole(role: string) {
    try {
      const query = 'SELECT * FROM users WHERE role = $1';
      const result = await pool.query(query, [role]);
      return result.rows;
    } catch (error: any) {
      console.error('Error fetching coaches:', error);
      throw new Error(`Failed to fetch coaches: ${error.message}`);
    }
  }
} 