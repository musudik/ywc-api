import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/db';
import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  coach_id?: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  coach_id?: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: string;
}

export class AuthService {
  private readonly JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_EXPIRES_IN = '24h';
  private readonly SALT_ROUNDS = 10;

  // Generate JWT token
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  // Verify JWT token
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Compare password
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      coach_id: user.coach_id
    };

    const token = this.generateToken(tokenPayload);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      expiresIn: this.JWT_EXPIRES_IN
    };
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { email, password, first_name, last_name, role = UserRole.CLIENT, coach_id } = userData;

    // Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUser = await pool.query(existingUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);
    const userId = uuidv4();

    // Create user
    const insertQuery = `
      INSERT INTO users (id, email, password, first_name, last_name, role, is_active, coach_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at
    `;

    const result = await pool.query(insertQuery, [
      userId,
      email,
      hashedPassword,
      first_name,
      last_name,
      role,
      true,
      coach_id
    ]);

    const newUser = result.rows[0];

    // Generate token
    const tokenPayload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      coach_id: newUser.coach_id
    };

    const token = this.generateToken(tokenPayload);

    return {
      user: newUser,
      token,
      expiresIn: this.JWT_EXPIRES_IN
    };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const query = 'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  // Refresh token
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const payload = this.verifyToken(token);
      const user = await this.getUserById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const newTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        coach_id: user.coach_id
      };

      const newToken = this.generateToken(newTokenPayload);

      return {
        user,
        token: newToken,
        expiresIn: this.JWT_EXPIRES_IN
      };
    } catch (error) {
      throw new Error('Invalid token for refresh');
    }
  }

  // Check if user can access personal details (for RBAC)
  async canAccessPersonalDetails(userId: string, role: UserRole, personalId: string): Promise<boolean> {
    // Admin can access everything
    if (role === UserRole.ADMIN) {
      return true;
    }

    // Get personal details to check coach_id
    const query = 'SELECT coach_id FROM personal_details WHERE personal_id = $1';
    const result = await pool.query(query, [personalId]);

    if (result.rows.length === 0) {
      return false;
    }

    const personalDetails = result.rows[0];

    // Coach can access their own clients' data
    if (role === UserRole.COACH && personalDetails.coach_id === userId) {
      return true;
    }

    // Client can access their own data (if they are the coach_id - this would be unusual but possible)
    if (role === UserRole.CLIENT && personalDetails.coach_id === userId) {
      return true;
    }

    return false;
  }

  // Check if user can manage specific personal details
  async canManagePersonalDetails(userId: string, role: UserRole, coachId?: string): Promise<boolean> {
    // Admin can manage everything
    if (role === UserRole.ADMIN) {
      return true;
    }

    // Coach can manage their own clients
    if (role === UserRole.COACH) {
      // If coachId is provided, check if it matches the user
      // If not provided, user is creating their own client
      return !coachId || coachId === userId;
    }

    // Clients typically can't create/manage personal details for others
    return false;
  }

  // Get coach's clients (for coaches to see their assigned clients)
  async getCoachClients(coachId: string): Promise<any[]> {
    const query = `
      SELECT 
        pd.user_id,
        pd.first_name,
        pd.last_name,
        pd.email,
        pd.applicant_type,
        pd.created_at
      FROM personal_details pd
      WHERE pd.coach_id = $1
      ORDER BY pd.created_at DESC
    `;
    
    const result = await pool.query(query, [coachId]);
    return result.rows;
  }
} 