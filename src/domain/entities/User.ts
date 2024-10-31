// src/domain/entities/User.ts
import { z } from "zod";
import { Address } from "./Address";
import { Phone } from "./Phone";
import { Document } from "./Document";
import { randomUUID } from "crypto";

export type UserProps = {
  email: string;
  passwordHash: string;
  name: string;
  birthDate?: Date;
  profilePicture?: string;
  address?: Address;
  phones: Phone[];
  document: Document;
};

export class User {
  public id: string;
  public email: string;
  public passwordHash: string;
  public name: string;
  public birthDate?: Date;
  public profilePicture?: string;
  public address?: Address;
  public phones: Phone[] = [];
  public document: Document;

  // Constructor privado para evitar instanciamento direto
  private constructor(props: UserProps, id?: string) {
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name;
    this.birthDate = props.birthDate;
    this.profilePicture = props.profilePicture;
    this.address = props.address;
    this.document = props.document;
    this.phones = props.phones || [];
    this.id = id || randomUUID();
  }

  // Método estático para criar um novo usuário (sem ID)
  public static create(props: UserProps): User {
    User.createUserSchema.parse(props);
    return new User(props);
  }

  // Método estático para carregar um usuário existente (com ID)
  public static with(props: UserProps, id: string): User {
    return new User(props, id);
  }

  // Schemas Zod para validação
  static createUserSchema = z.object({
    email: z.string().email("Invalid email format"),
    passwordHash: z.string().min(6, "Password must have at least 6 characters"),
    name: z.string().min(3, "Name must have at least 3 characters"),
    birthDate: z.date().nullable().optional(),
    profilePicture: z.string().nullable().optional(),
    address: Address.createAddressSchema.nullable().optional(),
    phones: z.array(Phone.createPhoneSchema).nullable().optional(),
    document: Document.createDocumentSchema,
  });

  static updateUserSchema = z.object({
    email: z.string().email().nullable().optional(),
    passwordHash: z.string().min(6).nullable().optional(),
    name: z.string().min(3).nullable().optional(),
    birthDate: z.date().nullable().optional(),
    profilePicture: z.instanceof(Buffer).nullable().optional(),
    address: Address.updateAddressSchema.nullable().optional(),
    phones: z.array(Phone.updatePhoneSchema).nullable().optional(),
    document: Document.updateDocumentSchema.nullable().optional(),
  });

  // Método de atualização de dados do usuário
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
        this.address = data.address;
      }
    }
    if (data.document) {
      this.document.updateDocument(data.document);
    }
    if (data.phones) {
      this.phones = data.phones.map((phoneData) => phoneData);
    }
  }
}
