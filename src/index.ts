import { PrismaClient } from "@prisma/client";
import { CreateUserUseCase } from "./application/UseCases/CreateUserUseCase";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { UpdateUserUseCase } from "./application/UseCases/UpdateUserUseCase";

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);

const create = new CreateUserUseCase(userRepository);
const update = new UpdateUserUseCase(userRepository);

const main = async () => {
  // const resposne = await create.execute({
  //   document: {
  //     cpf: "70119006405",
  //     rg: "0005",
  //     otherInfo: "sim",
  //   },
  //   email: "kawanarthuskate@gmail.com",
  //   name: "kawa",
  //   passwordHash: "hash12",
  //   phones: [
  //     {
  //       isPrimary: true,
  //       number: "84999221557",
  //     },
  //   ],
  //   birthDate: new Date(),
  // });

  const resposne = await update.execute({
    userId: "0084f630-6eee-41d1-a262-64b5a1e2194e",
    email: "kawanarthuskate@gmail.com",
    name: "kawa",
    passwordHash: "hash12",
    birthDate: new Date(),
    document: {
      cpf: "70119006405",
      rg: "0005",
      otherInfo: "sim",
    },
    phones: [
      {
        isPrimary: true,
        number: "84999221557",
      },
    ],
  });

  console.log(resposne);
};

main();

console.log("inicialized");
