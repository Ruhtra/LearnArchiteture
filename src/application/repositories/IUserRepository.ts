// src/application/repositories/IUserRepository.ts
import { User } from "../../domain/entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
