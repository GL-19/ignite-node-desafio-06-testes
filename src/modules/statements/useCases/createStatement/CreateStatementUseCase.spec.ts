import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit statement", async () => {
    const user = await usersRepository.create({
      name: "Glauber Loiola",
      email: "glauber@email.com",
      password: "12345",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "test deposit",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toBe(OperationType.DEPOSIT);
    expect(statement.user_id).toBe(user.id);
    expect(statement.amount).toBe(500);
    expect(statement.description).toBe("test deposit");
  });

  it("should not be able to create a statement if user does not exist", async () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "test",
        type: OperationType.DEPOSIT,
        amount: 400,
        description: "test deposit",
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "test",
        type: OperationType.WITHDRAW,
        amount: 400,
        description: "test withdraw",
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await usersRepository.create({
      name: "Glauber Loiola",
      email: "glauber@email.com",
      password: "12345",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "test deposit",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 300,
      description: "test withdraw",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toBe(OperationType.WITHDRAW);
    expect(statement.user_id).toBe(user.id);
    expect(statement.amount).toBe(300);
    expect(statement.description).toBe("test withdraw");
  });

  it("should not be able to create a withdraw if there is not enough funds", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "Glauber Loiola",
        email: "glauber@email.com",
        password: "12345",
      });

      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 300,
        description: "test withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
