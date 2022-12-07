import { IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  from: string;

  @IsNotEmpty()
  to: string;

  @IsNotEmpty()
  time: string;
}
