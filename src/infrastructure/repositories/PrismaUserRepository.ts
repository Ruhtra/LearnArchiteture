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
    const dataToUpdate: Prisma.XOR<
      Prisma.UserUpdateInput,
      Prisma.UserUncheckedUpdateInput
    > = {
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      birthDate: user.birthDate,
      profilePicture: user.profilePicture,
    };

    const operations: any[] = [];

    // Endereço
    if (user.address) {
      operations.push(
        this.prisma.address.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            id: user.address.id,
            street: user.address.street,
            number: user.address.number,
            postalCode: user.address.postalCode,
            city: user.address.city,
            country: user.address.country,
          },
          update: {
            street: user.address.street,
            number: user.address.number,
            postalCode: user.address.postalCode,
            city: user.address.city,
            country: user.address.country,
          },
        })
      );
    } else {
      operations.push(
        this.prisma.address.deleteMany({
          where: { userId: user.id },
        })
      );
    }

    // Telefones
    const phoneIds = user.phones
      .map((phone) => phone.id)
      .filter((id) => id !== undefined);

    operations.push(
      this.prisma.phone.deleteMany({
        where: {
          userId: user.id,
          id: { notIn: phoneIds },
        },
      })
    );

    user.phones.forEach((phone) => {
      if (phone.id) {
        operations.push(
          this.prisma.phone.update({
            where: { id: phone.id },
            data: {
              number: phone.number,
              isPrimary: phone.isPrimary,
            },
          })
        );
      } else {
        operations.push(
          this.prisma.phone.create({
            data: {
              id: phone.id,
              userId: user.id,
              number: phone.number,
              isPrimary: phone.isPrimary,
            },
          })
        );
      }
    });

    console.log(user.document);

    // Documento
    if (user.document) {
      operations.push(
        this.prisma.document.update({
          where: { id: user.document.id },
          data: {
            rg: user.document.rg,
            cpf: user.document.cpf,
            otherInfo: user.document.otherInfo,
          },
        })
      );
    }

    // Atualizar usuário
    operations.push(
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...dataToUpdate,
          updatedAt: new Date(),
        },
        include: {
          Address: true,
          phones: true,
          Document: true,
        },
      })
    );

    const [updatedUser] = await this.prisma.$transaction(operations);

    return this.mapPrismaUserToDomain(updatedUser);
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
      ? new Address(
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

    console.log("here");

    console.log(prismaUser.Document);

    const userDocument = new Document(
      {
        rg: prismaUser.Document.rg,
        cpf: prismaUser.Document.cpf,
        otherInfo: prismaUser.Document.otherInfo,
      },
      prismaUser.Document.id
    );

    console.log(userDocument);

    const userPhones = prismaUser.phones.map(
      (phone: any) =>
        new Phone(
          {
            number: phone.number,
            isPrimary: phone.isPrimary,
          },
          phone.id
        )
    );

    return new User(
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
