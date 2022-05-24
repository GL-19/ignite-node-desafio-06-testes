import { Statement } from "../../entities/Statement";

export type ICreateTransferDTO = {
  amount: number;
  description: string;
  sender_id: string;
  recipient_id: string;
};
