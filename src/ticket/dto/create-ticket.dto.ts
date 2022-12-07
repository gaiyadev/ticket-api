import { IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  bookId: number;
}
