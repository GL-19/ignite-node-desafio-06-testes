import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id: recipient_id } = request.params;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const responseData = await createTransferUseCase.execute({
      amount,
      description,
      sender_id,
      recipient_id,
    });

    return response.status(201).json(responseData);
  }
}

export { CreateTransferController };
