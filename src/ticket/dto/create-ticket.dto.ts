import { IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  bookId: number;

  @IsNotEmpty()
  userId: any;

  @IsNotEmpty()
  amount: any;

  @IsNotEmpty()
  seatNumber: any;
}
