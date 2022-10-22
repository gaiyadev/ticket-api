import { IsNotEmpty } from 'class-validator';

export class WalletTransferFund {
  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  accountId: string;
}
