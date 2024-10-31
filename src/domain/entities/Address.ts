// src/domain/entities/Address.ts
import { randomUUID } from "crypto";
import { z } from "zod";

export type AddressProps = {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
};

export class Address {
  public id: string;
  public street: string;
  public number: string;
  public postalCode: string;
  public city: string;
  public country: string;

  private constructor(props: AddressProps, id?: string) {
    this.street = props.street;
    this.number = props.number;
    this.postalCode = props.postalCode;
    this.city = props.city;
    this.country = props.country;
    this.id = id || randomUUID();
  }

  // Método estático para criar um novo endereço
  public static create(props: AddressProps): Address {
    Address.createAddressSchema.parse(props);
    return new Address(props);
  }

  // Método estático para carregar um endereço existente (com ID)
  public static with(props: AddressProps, id: string): Address {
    return new Address(props, id);
  }

  // Schemas Zod para validação
  static createAddressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    number: z.string().min(1, "Number is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
  });

  static updateAddressSchema = z.object({
    street: z.string().min(1).nullable().optional(),
    number: z.string().min(1).nullable().optional(),
    postalCode: z.string().min(1).nullable().optional(),
    city: z.string().min(1).nullable().optional(),
    country: z.string().min(1).nullable().optional(),
  });

  // Método de atualização usando Partial<AddressProps>
  public updateAddress(data: Partial<AddressProps>): void {
    Address.updateAddressSchema.parse(data);

    if (data.street) this.street = data.street;
    if (data.number) this.number = data.number;
    if (data.postalCode) this.postalCode = data.postalCode;
    if (data.city) this.city = data.city;
    if (data.country) this.country = data.country;
  }
}
