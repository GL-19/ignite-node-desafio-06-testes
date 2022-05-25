import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show selected user profile", async () => {
    const createUserDTO = {
      name: "Test",
      email: "test@email.com",
      password: "12345",
    };

    const { id, name, email } = await usersRepository.create(createUserDTO);

    const user = await showUserProfileUseCase.execute(id);

    expect(user).toHaveProperty("password");
    expect(user.id).toBe(id);
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  it("should not be able to show user profile if user id is nonexistent", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("nonexistent id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
