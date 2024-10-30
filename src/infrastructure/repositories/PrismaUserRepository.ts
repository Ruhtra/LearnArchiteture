// src/infrastructure/repositories/PrismaUserRepository.ts
import { PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { IUserRepository } from "../../application/repositories/IUserRepository";

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        birthDate: user.birthDate,
        profilePicture: user.profilePicture,
        Address: user.address
          ? {
              create: {
                street: user.address.street,
                number: user.address.number,
                postalCode: user.address.postalCode,
                city: user.address.city,
                country: user.address.country,
              },
            }
          : undefined,
      },
      include: { Address: true },
    });

    return this.mapPrismaUserToDomain(createdUser);
  }

  async update(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        birthDate: user.birthDate,
        profilePicture: user.profilePicture,
        Address: user.address
          ? {
              upsert: {
                create: {
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
              },
            }
          : undefined,
      },
      include: { Address: true },
    });

    return this.mapPrismaUserToDomain(updatedUser);
  }

  async findById(userId: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Address: true },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToDomain(user);
  }

  // Helper para mapear o Prisma User para o domínio User
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

    return new User(
      {
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        name: prismaUser.name,
        birthDate: prismaUser.birthDate,
        profilePicture: prismaUser.profilePicture,
        address: userAddress,
      },
      prismaUser.id
    );
  }
}
