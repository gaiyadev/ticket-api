import { IsNotEmpty, MinLength } from "class-validator";

export class SignInDto {
  @IsNotEmpty()
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
