import { IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  bookId: any;

  @IsNotEmpty()
  userId: any;

  @IsNotEmpty()
  amount: any;

  @IsNotEmpty()
  seatNumber: any;
}
