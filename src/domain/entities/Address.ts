// src/domain/entities/Address.ts
import { z } from "zod";

export class Address {
  public id: number;
  public street: string;
  public number: string;
  public postalCode: string;
  public city: string;
  public country: string;

  constructor(props: AddressProps, id?: number) {
    Address.createAddressSchema.parse(props); // Valida os dados de entrada

    this.street = props.street;
    this.number = props.number;
    this.postalCode = props.postalCode;
    this.city = props.city;
    this.country = props.country;
    this.id = id || 0;
  }

  // Definimos os tipos das propriedades de Address
  static createAddressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    number: z.string().min(1, "Number is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
  });

  static updateAddressSchema = z.object({
    street: z.string().min(1).optional().nullable(),
    number: z.string().min(1).optional().nullable(),
    postalCode: z.string().min(1).optional().nullable(),
    city: z.string().min(1).optional().nullable(),
    country: z.string().min(1).optional().nullable(),
  });

  public updateAddress(data: Partial<AddressProps>): void {
    Address.updateAddressSchema.parse(data);

    if (data.street) this.street = data.street;
    if (data.number) this.number = data.number;
    if (data.postalCode) this.postalCode = data.postalCode;
    if (data.city) this.city = data.city;
    if (data.country) this.country = data.country;
  }
}

// Defina um tipo que contenha as propriedades brutas de um Address
export type AddressProps = {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
};
