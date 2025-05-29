import { pool } from '../config/db';
import { FamilyMember } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FamilyMemberService {
  
  // Create new family member
  async createFamilyMember(data: any): Promise<FamilyMember> {
    const familyMemberId = uuidv4();
    
    const query = `
      INSERT INTO family_members (
        family_member_id, user_id, first_name, last_name, relation, 
        birth_date, nationality, tax_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      familyMemberId,
      data.user_id,
      data.first_name,
      data.last_name,
      data.relation,
      data.birth_date,
      data.nationality,
      data.tax_id || null
    ];
    
    try {
      const result = await pool.query(query, values);
      return this.mapRowToFamilyMember(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to create family member: ${error.message}`);
    }
  }
  
  // Get family member by ID
  async getFamilyMemberById(familyMemberId: string): Promise<FamilyMember | null> {
    const query = 'SELECT * FROM family_members WHERE family_member_id = $1';
    
    try {
      const result = await pool.query(query, [familyMemberId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFamilyMember(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to get family member: ${error.message}`);
    }
  }

  // Get family members by user ID
  async getFamilyMembersByUserId(userId: string): Promise<FamilyMember[]> {
    const query = 'SELECT * FROM family_members WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this.mapRowToFamilyMember(row));
    } catch (error: any) {
      throw new Error(`Failed to get family members by user ID: ${error.message}`);
    }
  }

  // Get family members by relation type
  async getFamilyMembersByRelation(userId: string, relation: string): Promise<FamilyMember[]> {
    const query = 'SELECT * FROM family_members WHERE user_id = $1 AND relation = $2 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId, relation]);
      return result.rows.map(row => this.mapRowToFamilyMember(row));
    } catch (error: any) {
      throw new Error(`Failed to get family members by relation: ${error.message}`);
    }
  }
  
  // Get all family members with optional filters
  async getAllFamilyMembers(filters?: any): Promise<FamilyMember[]> {
    let query = 'SELECT * FROM family_members';
    const values: any[] = [];
    const conditions: string[] = [];
    
    if (filters) {
      if (filters.relation) {
        conditions.push(`relation = $${conditions.length + 1}`);
        values.push(filters.relation);
      }
      if (filters.nationality) {
        conditions.push(`nationality = $${conditions.length + 1}`);
        values.push(filters.nationality);
      }
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => this.mapRowToFamilyMember(row));
    } catch (error: any) {
      throw new Error(`Failed to get all family members: ${error.message}`);
    }
  }
  
  // Update family member by ID
  async updateFamilyMember(
    familyMemberId: string, 
    data: Partial<Omit<FamilyMember, 'family_member_id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<FamilyMember | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      UPDATE family_members 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE family_member_id = $${paramCount}
      RETURNING *
    `;
    
    values.push(familyMemberId);
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToFamilyMember(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to update family member: ${error.message}`);
    }
  }
  
  // Delete family member by ID
  async deleteFamilyMember(familyMemberId: string): Promise<boolean> {
    const query = 'DELETE FROM family_members WHERE family_member_id = $1';
    
    try {
      const result = await pool.query(query, [familyMemberId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting family member:', error);
      throw new Error('Failed to delete family member');
    }
  }

  // Delete all family members for a user
  async deleteFamilyMembersByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM family_members WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('Error deleting family members by user ID:', error);
      throw new Error('Failed to delete family members');
    }
  }
  
  // Helper method to map database row to FamilyMember interface
  private mapRowToFamilyMember(row: any): FamilyMember {
    return {
      family_member_id: row.family_member_id,
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      relation: row.relation,
      birth_date: row.birth_date,
      nationality: row.nationality,
      tax_id: row.tax_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

// Default export
export default FamilyMemberService; 