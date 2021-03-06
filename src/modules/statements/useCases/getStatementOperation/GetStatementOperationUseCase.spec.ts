import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getStatementOperation: GetStatementOperationUseCase;

describe("Get Statement Operation Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();

    statementsRepository = new InMemoryStatementsRepository();

    getStatementOperation = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to get a statement operation", async () => {
    const user = await usersRepository.create({
      name: "test name",
      email: "test@email.com",
      password: "12345",
    });

    const deposit = await statementsRepository.create({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "test deposit",
    });

    const withdraw = await statementsRepository.create({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 300,
      description: "test withdraw",
    });

    const depositStatement = await getStatementOperation.execute({
      user_id: user.id,
      statement_id: deposit.id,
    });

    const withdrawStatement = await getStatementOperation.execute({
      user_id: user.id,
      statement_id: withdraw.id,
    });

    expect(depositStatement).toEqual(deposit);
    expect(withdrawStatement).toEqual(withdraw);
  });

  it("should not be able to get a statement operation if user does not exist", async () => {
    expect(async () => {
      await getStatementOperation.execute({
        user_id: "fake user id",
        statement_id: "fake statement id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement operation if statement does not exist", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "test name",
        email: "test@email.com",
        password: "12345",
      });

      await getStatementOperation.execute({
        user_id: user.id,
        statement_id: "fake statement id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
