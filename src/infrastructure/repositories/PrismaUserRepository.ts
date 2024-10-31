// src/infrastructure/repositories/PrismaUserRepository.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Document } from "../../domain/entities/Document";
import { IUserRepository } from "../../application/repositories/IUserRepository";
import { Phone } from "../../domain/entities/Phone";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { tuple } from "zod";

export class PrismaUserRepository implements IUserRepository {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        birthDate: user.birthDate,
        profilePicture: user.profilePicture,
        Address: user.address
          ? {
              create: {
                id: user.address.id,
                street: user.address.street,
                number: user.address.number,
                postalCode: user.address.postalCode,
                city: user.address.city,
                country: user.address.country,
              },
            }
          : undefined,
        Document: {
          create: {
            id: user.document.id,
            cpf: user.document.cpf,
            rg: user.document.rg,
            otherInfo: user.document.otherInfo,
          },
        },
        phones: {
          create: user.phones.map((phone) => ({
            id: phone.id,
            number: phone.number,
            isPrimary: phone.isPrimary,
          })),
        },
      },
      include: { Address: true, Document: true, phones: true },
    });

    return this.mapPrismaUserToDomain(createdUser);
  }
  async update(user: User): Promise<User> {
    // Verificar se o Address existe antes de executar o update
    const existingAddress = await this.prisma.address.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    const phoneIdsFromClient = user.phones
      .map((phone) => phone.id)
      .filter((id) => id !== undefined);

    const response = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        birthDate: user.birthDate,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        profilePicture: user.profilePicture,

        Document: user.document
          ? {
              upsert: {
                create: {
                  cpf: user.document.cpf,
                  id: user.document.id,
                  rg: user.document.rg,
                  otherInfo: user.document.otherInfo,
                },
                update: {
                  cpf: user.document.cpf,
                  rg: user.document.rg,
                  otherInfo: user.document.otherInfo,
                },
              },
            }
          : { delete: true },

        Address: user.address
          ? {
              upsert: {
                create: {
                  city: user.address.city,
                  country: user.address.country,
                  id: user.address.id,
                  number: user.address.number,
                  postalCode: user.address.postalCode,
                  street: user.address.street,
                },
                update: {
                  city: user.address.city,
                  country: user.address.country,
                  number: user.address.number,
                  postalCode: user.address.postalCode,
                  street: user.address.street,
                },
              },
            }
          : existingAddress
          ? { delete: true }
          : undefined,
        phones: {
          deleteMany: {
            id: { notIn: phoneIdsFromClient },
          },
          upsert: user.phones.map((phone) => ({
            where: { id: phone.id },
            create: {
              id: phone.id,
              number: phone.number,
              isPrimary: phone.isPrimary,
            },
            update: {
              number: phone.number,
              isPrimary: phone.isPrimary,
            },
          })),
        },
      },
      include: {
        Address: true,
        Document: true,
        phones: true,
      },
    });

    return this.mapPrismaUserToDomain(response);
  }

  async findById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { Address: true, Document: true, phones: true },
    });

    return user ? this.mapPrismaUserToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { Address: true, Document: true, phones: true },
    });

    return user ? this.mapPrismaUserToDomain(user) : null;
  }

  private mapPrismaUserToDomain(prismaUser: any): User {
    const userAddress = prismaUser.Address
      ? Address.with(
          {
            street: prismaUser.Address.street,
            number: prismaUser.Address.number,
            postalCode: prismaUser.Address.postalCode,
            city: prismaUser.Address.city,
            country: prismaUser.Address.country,
          },
          prismaUser.Address.id
        )
      : undefined;

    const userDocument = Document.with(
      {
        rg: prismaUser.Document.rg,
        cpf: prismaUser.Document.cpf,
        otherInfo: prismaUser.Document.otherInfo,
      },
      prismaUser.Document.id
    );

    const userPhones = prismaUser.phones.map((phone: any) =>
      Phone.with(
        {
          number: phone.number,
          isPrimary: phone.isPrimary,
        },
        phone.id
      )
    );

    return User.with(
      {
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        name: prismaUser.name,
        birthDate: prismaUser.birthDate,
        profilePicture: prismaUser.profilePicture,
        address: userAddress,
        document: userDocument,
        phones: userPhones,
      },
      prismaUser.id
    );
  }
}
