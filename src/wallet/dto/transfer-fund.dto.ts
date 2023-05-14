import { IsNotEmpty } from 'class-validator';

export class WalletTransferFund {
  @IsNotEmpty()
  amount: any;

  @IsNotEmpty()
  accountId: any;

  @IsNotEmpty()
  userId: number;
}
