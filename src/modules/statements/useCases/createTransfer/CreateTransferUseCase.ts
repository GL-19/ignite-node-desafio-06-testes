import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    sender_id,
    recipient_id,
  }: ICreateTransferDTO): Promise<Statement[]> {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferError.UserNotFound();
    }

    const senderBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (senderBalance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const recipient = await this.usersRepository.findById(recipient_id);

    if (!recipient) {
      throw new CreateTransferError.RecipientNotFound();
    }

    const senderStatement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: sender_id,
      sender_id: sender_id,
      recipient_id: recipient_id,
    });

    const recipientStatement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: recipient_id,
      sender_id: sender_id,
      recipient_id: recipient_id,
    });

    return [senderStatement, recipientStatement];
  }
}

export { CreateTransferUseCase };
