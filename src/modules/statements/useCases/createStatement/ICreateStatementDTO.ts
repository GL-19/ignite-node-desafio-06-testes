import { OperationType, Statement } from "../../entities/Statement";

export type ICreateStatementDTO = {
  user_id: string;
  recipient_id?: string;
  sender_id?: string;
  amount: number;
  description: string;
  type: OperationType;
};
