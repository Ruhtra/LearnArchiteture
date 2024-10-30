// src/domain/entities/Document.ts
import { z } from "zod";

export class Document {
  public id: number;
  public rg: string;
  public cpf: string;
  public otherInfo?: string;

  constructor(props: DocumentProps, id?: number) {
    Document.createDocumentSchema.parse(props);

    this.rg = props.rg;
    this.cpf = props.cpf;
    this.otherInfo = props.otherInfo;
    this.id = id || 0;
  }

  static createDocumentSchema = z.object({
    rg: z.string().min(1, "RG is required"),
    cpf: z.string().min(11, "CPF must have at least 11 characters"),
    otherInfo: z.string().optional(),
  });

  static updateDocumentSchema = z.object({
    rg: z.string().optional(),
    cpf: z.string().optional(),
    otherInfo: z.string().optional(),
  });

  public updateDocument(data: Partial<DocumentProps>): void {
    Document.updateDocumentSchema.parse(data);

    if (data.rg) this.rg = data.rg;
    if (data.cpf) this.cpf = data.cpf;
    if (data.otherInfo) this.otherInfo = data.otherInfo;
  }
}

export type DocumentProps = {
  cpf: string;
  rg: string;
  otherInfo?: string;
};
