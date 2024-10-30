// src/application/repositories/IUserRepository.ts
import { User } from "../../domain/entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findById(userId: number): Promise<User | null>;
}
