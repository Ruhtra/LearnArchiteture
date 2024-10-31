// src/domain/entities/Document.ts
import { randomUUID } from "crypto";
import { z } from "zod";

export type DocumentProps = {
  rg: string;
  cpf: string;
  otherInfo?: string;
};

export class Document {
  public id: string;
  public rg: string;
  public cpf: string;
  public otherInfo?: string;

  private constructor(props: DocumentProps, id?: string) {
    this.rg = props.rg;
    this.cpf = props.cpf;
    this.otherInfo = props.otherInfo;
    this.id = id || randomUUID();
  }

  // Método estático para criar um novo documento
  public static create(props: DocumentProps): Document {
    Document.createDocumentSchema.parse(props);
    return new Document(props);
  }

  // Método estático para carregar um documento existente (com ID)
  public static with(props: DocumentProps, id: string): Document {
    return new Document(props, id);
  }

  // Schemas Zod para validação
  static createDocumentSchema = z.object({
    rg: z.string().min(1, "RG is required"),
    cpf: z.string().min(11, "CPF must have at least 11 characters"),
    otherInfo: z.string().nullable().optional(),
  });

  static updateDocumentSchema = z.object({
    rg: z.string().nullable().optional(),
    cpf: z.string().nullable().optional(),
    otherInfo: z.string().nullable().optional(),
  });

  public updateDocument(data: Partial<Document>): void {
    Document.updateDocumentSchema.parse(data);

    if (data.rg) this.rg = data.rg;
    if (data.cpf) this.cpf = data.cpf;
    if (data.otherInfo) this.otherInfo = data.otherInfo;
  }
}
