// src/domain/entities/Phone.ts
import { randomUUID } from "crypto";
import { z } from "zod";

export type PhoneProps = {
  number: string;
  isPrimary: boolean;
};

export class Phone {
  public id: string;
  public number: string;
  public isPrimary: boolean;

  private constructor(props: PhoneProps, id?: string) {
    this.number = props.number;
    this.isPrimary = props.isPrimary;
    this.id = id || randomUUID();
  }

  // Método estático para criar um novo telefone
  public static create(props: PhoneProps): Phone {
    Phone.createPhoneSchema.parse(props);
    return new Phone(props);
  }

  // Método estático para carregar um telefone existente (com ID)
  public static with(props: PhoneProps, id: string): Phone {
    return new Phone(props, id);
  }

  // Schemas Zod para validação
  static createPhoneSchema = z.object({
    number: z.string().min(10, "Phone number must have at least 10 digits"),
    isPrimary: z.boolean().nullable().optional().default(false),
  });

  static updatePhoneSchema = z.object({
    number: z.string().min(10).nullable().optional(),
    isPrimary: z.boolean().nullable().optional(),
  });

  public updatePhone(data: Partial<Phone>): void {
    Phone.updatePhoneSchema.parse(data);

    if (data.number) this.number = data.number;
    if (data.isPrimary !== undefined) this.isPrimary = data.isPrimary;
  }
}
