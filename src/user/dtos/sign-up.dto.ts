import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  middleName: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  reqNumber: string;

  @MinLength(3)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  department: string;

  @IsNotEmpty()
  level: string;

  @IsNotEmpty()
  course: string;

  @IsNotEmpty()
  faculty: string;
}
