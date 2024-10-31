// src/application/use-cases/CreateUserUseCase.ts
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Document } from "../../domain/entities/Document";
import { Phone } from "../../domain/entities/Phone";

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
  document: {
    cpf: string;
    rg: string;
    otherInfo?: string;
  };
  phones: {
    number: string;
    isPrimary: boolean;
  }[];
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserRequest): Promise<User> {
    const userFinded = await this.userRepository.findByEmail(data.email);
    if (!!userFinded) throw new Error("Email already exist");

    const user = User.create({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      birthDate: data.birthDate,
      profilePicture: data.profilePicture,
      address: data.address
        ? Address.create({
            street: data.address.street,
            number: data.address.number,
            postalCode: data.address.postalCode,
            city: data.address.city,
            country: data.address.country,
          })
        : undefined,
      document: Document.create({
        cpf: data.document.cpf,
        rg: data.document.rg,
        otherInfo: data.document.otherInfo,
      }),
      phones: data.phones.map((phone) => {
        return Phone.create({
          number: phone.number,
          isPrimary: phone.isPrimary,
        });
      }),
    });

    return await this.userRepository.create(user);
  }
}
