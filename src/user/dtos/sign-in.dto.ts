import { IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  regNumber: string;

  // @MinLength(2)
  @IsNotEmpty()
  password: string;
}
