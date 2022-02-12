import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

import { compare } from "bcryptjs";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Create User Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const password = "12345";

    const user = await createUserUseCase.execute({
      name: "Glauber Loiola",
      email: "glauber@email.com",
      password,
    });

    const passwordMatch = await compare(password, user.password);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("Glauber Loiola");
    expect(user.email).toBe("glauber@email.com");
    expect(passwordMatch).toBe(true);
  });

  it("should not be able to create a new user if email already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Glauber Loiola",
        email: "glauber@email.com",
        password: "12345",
      });

      await createUserUseCase.execute({
        name: "Glauber Loiola",
        email: "glauber@email.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
