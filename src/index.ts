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
    userId: "fdc2cfbd-fffc-42f9-be22-8e92cb76e782",
    email: "kawanarthuskate@gmail.com",
    name: "kawa",
    passwordHash: "hash12",
    birthDate: new Date(),
    document: {
      cpf: "70119006405",
      rg: "0004",
      otherInfo: "sim",
    },
    // address: {
    //   city: "aaaa",
    //   country: "ohamaga",
    //   number: "ohamaga",
    //   postalCode: "ohamaga",
    //   street: "ohamaga",
    // },
    phones: [
      {
        id: "50b11780-7562-4c91-b918-00b968373a29",
        isPrimary: true,
        number: "84996993533",
      },
      {
        isPrimary: false,
        number: "84999221557",
      },
    ],
  });

  console.log(resposne);
};

main();

console.log("inicialized");
