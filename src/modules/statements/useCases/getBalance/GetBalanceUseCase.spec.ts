import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();

    statementsRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to get user balance", async () => {
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

    const { statement, balance } = await getBalanceUseCase.execute({
      user_id: user.id,
    });

    expect(balance).toBe(200);
    expect(statement).toHaveLength(2);
    expect(statement[0]).toEqual(deposit);
    expect(statement[1]).toEqual(withdraw);
  });

  it("should not be able to get balance if user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "fake id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
