import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show selected user profile", async () => {
    const createUserDTO = {
      name: "Test",
      email: "test@email.com",
      password: "12345",
    };

    const { id, name, email } = await createUserUseCase.execute(createUserDTO);

    const user = await showUserProfileUseCase.execute(id);

    expect(user).toHaveProperty("password");
    expect(user.id).toBe(id);
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  it("should not be able to show user profile if user id is nonexistent", async () => {
    expect(async () => {
      const user = await showUserProfileUseCase.execute("nonexistent id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
