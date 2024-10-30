// src/application/use-cases/CreateUserUseCase.ts
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";

interface CreateUserRequest {
  email: string;
  passwordHash: string;
  name: string;
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

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserRequest): Promise<User> {
    const user = new User({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      birthDate: data.birthDate,
      profilePicture: data.profilePicture,
      address: data.address
        ? new Address({
            street: data.address.street,
            number: data.address.number,
            postalCode: data.address.postalCode,
            city: data.address.city,
            country: data.address.country,
          })
        : undefined,
    });

    return await this.userRepository.create(user);
  }
}
