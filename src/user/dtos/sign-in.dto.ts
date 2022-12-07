import { IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  reqNumber: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
