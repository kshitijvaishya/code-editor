import { getDatabase } from './mongodb';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  createdAt: string;
  codeRuns?: number;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  codeRuns: number;
}

class UserDatabase {
  private async getUsersCollection() {
    const db = await getDatabase();
    return db.collection<User>('users');
  }

  async createUser(username: string, email: string, password: string): Promise<UserResponse> {
    const collection = await this.getUsersCollection();
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user: User = {
      id: userId,
      username,
      email: email.toLowerCase(),
      password, // Should be hashed
      createdAt: new Date().toISOString(),
      codeRuns: 0,
    };

    await collection.insertOne(user as any);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      codeRuns: user.codeRuns || 0,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getUsersCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const collection = await this.getUsersCollection();
    const user = await collection.findOne({ id: userId });
    
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      codeRuns: user.codeRuns || 0,
    };
  }

  async incrementCodeRuns(userId: string): Promise<void> {
    const collection = await this.getUsersCollection();
    await collection.updateOne(
      { id: userId },
      { $inc: { codeRuns: 1 } }
    );
  }

  async emailExists(email: string): Promise<boolean> {
    const collection = await this.getUsersCollection();
    const user = await collection.findOne({ email: email.toLowerCase() });
    return !!user;
  }
}

export const userDb = new UserDatabase();
