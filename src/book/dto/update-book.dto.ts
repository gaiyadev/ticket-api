import { IsNotEmpty } from 'class-validator';

export class UpdateBookDto {
  @IsNotEmpty()
  from: string;

  @IsNotEmpty()
  to: string;

  @IsNotEmpty()
  time: string;
}
