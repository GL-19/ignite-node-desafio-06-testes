import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to authenticate user", async () => {
    const name = "Test";
    const email = "test@email.com";
    const password = "12345";

    await createUserUseCase.execute({
      name,
      email,
      password,
    });

    const response = await authenticateUserUseCase.execute({
      email,
      password,
    });

    expect(response).toHaveProperty("user");
    expect(response).toHaveProperty("token");
    expect(response.user).toHaveProperty("id");
    expect(response.user.name).toBe(name);
    expect(response.user.email).toBe(email);
  });

  it("should not be able to authenticate if email is incorrect", async () => {
    expect(async () => {
      const name = "Test";
      const email = "test@email.com";
      const password = "12345";

      await createUserUseCase.execute({
        name,
        email,
        password,
      });

      const response = await authenticateUserUseCase.execute({
        email: "incorrect@email.com",
        password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
  it("should not be able to authenticate if password is incorrect", async () => {
    expect(async () => {
      const name = "Test";
      const email = "test@email.com";
      const password = "12345";

      await createUserUseCase.execute({
        name,
        email,
        password,
      });

      const response = await authenticateUserUseCase.execute({
        email,
        password: "incorrect",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
