// src/domain/entities/User.ts
import { z } from "zod";
import { Address, AddressProps } from "./Address";
import { Phone, PhoneProps } from "./Phone";
import { Document, DocumentProps } from "./Document";

export class User {
  public id: number;
  public email: string;
  public passwordHash: string;
  public name: string;
  public birthDate?: Date;
  public profilePicture?: string;
  public address?: Address;
  public phones: Phone[] = []; // Relacionamento 1:N
  public document: Document; // Relacionamento 1:1 obrigatório

  constructor(props: UserProps, id?: number) {
    User.createUserSchema.parse(props);

    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name;
    this.birthDate = props.birthDate;
    this.profilePicture = props.profilePicture;
    this.address = props.address ? new Address(props.address) : undefined;
    this.document = new Document(props.document);
    this.phones = props.phones.map((phone) => new Phone(phone));
    this.id = id || 0;
  }

  static createUserSchema = z.object({
    email: z.string().email("Invalid email format"),
    passwordHash: z.string().min(6, "Password must have at least 6 characters"),
    name: z.string().min(3, "Name must have at least 3 characters"),
    birthDate: z.date().optional().nullable(),
    profilePicture: z.string().optional().nullable(),
    address: Address.createAddressSchema.optional().nullable(),
    phones: z.array(Phone.createPhoneSchema).optional().nullable(),
    document: Document.createDocumentSchema, // Documento obrigatório
  });

  static updateUserSchema = z.object({
    email: z.string().email().optional().nullable(),
    passwordHash: z.string().min(6).optional().nullable(),
    name: z.string().min(3).optional().nullable(),
    birthDate: z.date().optional().nullable(),
    profilePicture: z.string().optional().nullable(),
    address: Address.updateAddressSchema.optional().nullable(),
    phones: z.array(Phone.updatePhoneSchema).optional().nullable(),
    document: Document.updateDocumentSchema.optional().nullable(),
  });

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
        this.address = new Address(data.address);
      }
    }
    if (data.document) this.document.updateDocument(data.document);

    if (data.phones)
      this.phones = data.phones.map((phoneData) => new Phone(phoneData));
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
  document: DocumentProps;
  phones: PhoneProps[];
};
