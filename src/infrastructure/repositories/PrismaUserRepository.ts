// src/infrastructure/repositories/PrismaUserRepository.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Document } from "../../domain/entities/Document";
import { IUserRepository } from "../../application/repositories/IUserRepository";
import { Phone } from "../../domain/entities/Phone";
import { DefaultArgs } from "@prisma/client/runtime/library";

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
    const usera = await this.findById(user.id);

    console.log("old");
    console.log(usera);

    console.log("novo");
    console.log(user);
    if (usera) return usera;
    throw new Error("");
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
