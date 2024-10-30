import { PrismaClient } from "@prisma/client";
import { CreateUserUseCase } from "./application/UseCases/CreateUserUseCase";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);

const create = new CreateUserUseCase(userRepository);

const main = async () => {
  const resposne = await create.execute({
    document: {
      cpf: "70119006405",
      rg: "0005",
      otherInfo: "sim",
    },
    email: "kawanarthuskate@gmail.com",
    name: "kawa",
    passwordHash: "hash12",
    phones: [
      {
        isPrimary: true,
        number: "84999221557",
      },
    ],
    birthDate: new Date(),
  });

  console.log(resposne);
};

main();

console.log("inicialized");
