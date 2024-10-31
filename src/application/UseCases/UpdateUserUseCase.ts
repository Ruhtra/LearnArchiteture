// src/application/use-cases/UpdateUserUseCase.ts
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Address, AddressProps } from "../../domain/entities/Address";
import { DocumentProps } from "../../domain/entities/Document";
import { Phone, PhoneProps } from "../../domain/entities/Phone";

interface UpdateUserRequest {
  userId: string;
  email?: string;
  passwordHash?: string;
  name?: string;
  birthDate?: Date;
  profilePicture?: string;
  address?: AddressProps;
  document?: DocumentProps;
  phones?: {
    id?: string;
    number: string;
    isPrimary: boolean;
  }[];
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: UpdateUserRequest): Promise<User | null> {
    // Buscar o usuário no repositório
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Atualizar os dados do usuário
    user.updateUser({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      birthDate: data.birthDate,
      profilePicture: data.profilePicture,
    });

    if (user.address) {
      if (data.address) {
        user.address.updateAddress({
          city: data.address.city,
          country: data.address.country,
          number: data.address.number,
          postalCode: data.address.postalCode,
          street: data.address.street,
        });
      } else {
        user.address = undefined;
      }
    } else {
      if (data.address) {
        user.address = Address.create({
          city: data.address.city,
          country: data.address.country,
          number: data.address.number,
          postalCode: data.address.postalCode,
          street: data.address.street,
        });
      } else {
        //nothing
      }
    }

    if (data.document) {
      user.document.updateDocument({
        cpf: data.document.cpf,
        otherInfo: data.document.otherInfo,
        rg: data.document.rg,
      });
    }

    // Atualizar a lista de phones
    if (data.phones) {
      const existingPhones: string[] = user.phones.map((phone) => phone.id);

      // Adicionar ou atualizar os phones enviados
      user.phones = data.phones.map((phoneData) => {
        if (phoneData.id && existingPhones.includes(phoneData.id)) {
          // Atualizar phone existente
          const phone = user.phones.find((p) => p.id === phoneData.id);
          if (phone) phone.updatePhone(phoneData);
          return phone!;
        } else {
          // Criar novo phone
          return Phone.create(phoneData);
        }
      });
    }

    // Persistir as atualizações no banco de dados
    const updatedUser = await this.userRepository.update(user);

    return updatedUser;
  }
}
