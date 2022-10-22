import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionType } from '../interfaces/transaction-type.interface';

export class CreateTransactionDto {
  @IsEnum(TransactionType, {
    message: `Value must be ${TransactionType.Transfer} or ${TransactionType.funding} or ${TransactionType.Reversal}`,
  })
  @IsNotEmpty()
  transactionType: TransactionType;

  @IsNotEmpty()
  amount: number;
}
