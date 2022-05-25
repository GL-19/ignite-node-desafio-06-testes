import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateTransferError } from "./CreateTransferError";
import { OperationType } from "../../entities/Statement";

let createTransferUseCase: CreateTransferUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

describe("Create Transfer Use Case", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should not be able to transfer if user does not exist", async () => {
    await expect(
      createTransferUseCase.execute({
        amount: 0,
        description: "test transfer",
        recipient_id: "invalid recipient",
        sender_id: "invalid sender",
      })
    ).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it("should not be able to transfer if recipient does not exist", async () => {
    const sender = await usersRepository.create({
      email: "sender@email.com",
      name: "Sender Name",
      password: "ABCDE",
    });

    await expect(
      createTransferUseCase.execute({
        amount: 0,
        description: "test transfer",
        recipient_id: "invalid recipient",
        sender_id: sender.id,
      })
    ).rejects.toBeInstanceOf(CreateTransferError.RecipientNotFound);
  });

  it("should not be able to transfer if user does not have enough funds", async () => {
    const sender = await usersRepository.create({
      email: "sender@email.com",
      name: "Sender Name",
      password: "ABCDE",
    });

    const recipient = await usersRepository.create({
      email: "recipient@email.com",
      name: "Recipient Name",
      password: "12345",
    });

    await expect(
      createTransferUseCase.execute({
        amount: 100,
        description: "test transfer",
        recipient_id: recipient.id,
        sender_id: sender.id,
      })
    ).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
  });

  it("should be able to transfer money between accounts", async () => {
    const sender = await usersRepository.create({
      email: "sender@email.com",
      name: "Sender Name",
      password: "ABCDE",
    });

    const recipient = await usersRepository.create({
      email: "recipient@email.com",
      name: "Recipient Name",
      password: "12345",
    });

    await statementsRepository.create({
      amount: 200,
      description: "Deposit",
      type: OperationType.DEPOSIT,
      user_id: sender.id,
    });

    const transferStatement = await createTransferUseCase.execute({
      amount: 100,
      description: "test transfer",
      recipient_id: recipient.id,
      sender_id: sender.id,
    });

    expect(transferStatement.user_id).toBe(sender.id);
    expect(transferStatement.sender_id).toBe(sender.id);
    expect(transferStatement.recipient_id).toBe(recipient.id);
    expect(transferStatement.amount).toBe(100);
    expect(transferStatement.description).toBe("test transfer");
  });
});
