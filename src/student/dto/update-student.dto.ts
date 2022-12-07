import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateStudentDto {
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

  @IsNotEmpty()
  department: string;

  @IsNotEmpty()
  level: string;

  @IsNotEmpty()
  course: string;

  @IsNotEmpty()
  faculty: string;
}
