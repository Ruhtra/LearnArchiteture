// src/domain/entities/User.ts
import { z } from "zod";
import { Address, AddressProps } from "./Address"; // Importando a entidade e os tipos de Address

export class User {
  public id: number;
  public email: string;
  public passwordHash: string;
  public name: string;
  public birthDate?: Date;
  public profilePicture?: string;
  public address?: Address; // Endereço opcional

  constructor(props: UserProps, id?: number) {
    // Valida os dados de criação de usuário usando Zod
    User.createUserSchema.parse(props);

    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name;
    this.birthDate = props.birthDate;
    this.profilePicture = props.profilePicture;
    this.address = props.address ? new Address(props.address) : undefined;
    this.id = id || 0;
  }

  // Tipos de dados para as propriedades de User (sem métodos)
  static createUserSchema = z.object({
    email: z.string().email("Invalid email format"),
    passwordHash: z.string().min(6, "Password must have at least 6 characters"),
    name: z.string().min(3, "Name must have at least 3 characters"),
    birthDate: z.date().optional(),
    profilePicture: z.string().optional(),
    address: Address.createAddressSchema.optional(),
  });

  static updateUserSchema = z.object({
    email: z.string().email().optional(),
    passwordHash: z.string().min(6).optional(),
    name: z.string().min(3).optional(),
    birthDate: z.date().optional(),
    profilePicture: z.string().optional(),
    address: Address.updateAddressSchema.optional(),
  });

  // Método para atualizar os dados do usuário
  public updateUser(data: Partial<UserProps>): void {
    User.updateUserSchema.parse(data);

    if (data.email) this.email = data.email;
    if (data.passwordHash) this.passwordHash = data.passwordHash;
    if (data.name) this.name = data.name;
    if (data.birthDate) this.birthDate = data.birthDate;
    if (data.profilePicture) this.profilePicture = data.profilePicture;
    if (data.address) {
      if (this.address) {
        this.address.updateAddress(data.address);
      } else {
        this.address = new Address(data.address as AddressProps);
      }
    }
  }
}

// Defina o tipo UserProps que contém apenas os dados brutos de User (sem métodos)
export type UserProps = {
  email: string;
  passwordHash: string;
  name: string;
  birthDate?: Date;
  profilePicture?: string;
  address?: AddressProps;
};
