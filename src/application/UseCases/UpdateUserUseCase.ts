// src/application/use-cases/UpdateUserUseCase.ts
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../../domain/entities/User";

interface UpdateUserRequest {
  userId: number;
  email?: string;
  passwordHash?: string;
  name?: string;
  birthDate?: Date;
  profilePicture?: string;
  address?: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: UpdateUserRequest): Promise<User | null> {
    const user = await this.userRepository.findById(data.userId);

    if (!user) throw new Error("User not found");

    user.updateUser({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      birthDate: data.birthDate,
      profilePicture: data.profilePicture,
      address: data.address
        ? {
            street: data.address.street,
            number: data.address.number,
            postalCode: data.address.postalCode,
            city: data.address.city,
            country: data.address.country,
          }
        : undefined,
    });

    return await this.userRepository.update(user);
  }
}
