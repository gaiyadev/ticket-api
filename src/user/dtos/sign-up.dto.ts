import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  middleName: string;

  @IsNotEmpty()
  department: string;

  @IsNotEmpty()
  level: string;

  @IsNotEmpty()
  course: string;

  @IsNotEmpty()
  faculty: string;
}
