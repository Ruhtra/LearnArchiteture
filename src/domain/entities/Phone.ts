// src/domain/entities/Phone.ts
import { z } from "zod";

export class Phone {
  public id: number;
  public number: string;
  public isPrimary: boolean;

  constructor(props: PhoneProps, id?: number) {
    Phone.createPhoneSchema.parse(props);

    this.number = props.number;
    this.isPrimary = props.isPrimary;
    this.id = id || 0;
  }

  static createPhoneSchema = z.object({
    number: z.string().min(10, "Phone number must have at least 10 digits"),
    isPrimary: z.boolean().optional().default(false),
  });

  static updatePhoneSchema = z.object({
    number: z.string().min(10).optional(),
    isPrimary: z.boolean().optional(),
  });

  public updatePhone(data: Partial<PhoneProps>): void {
    Phone.updatePhoneSchema.parse(data);

    if (data.number) this.number = data.number;
    if (data.isPrimary !== undefined) this.isPrimary = data.isPrimary;
  }
}

export type PhoneProps = {
  number: string;
  isPrimary: boolean;
};
