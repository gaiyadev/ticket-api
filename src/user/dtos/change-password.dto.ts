import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../custom-decorators/match.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password length must be more than 6 characters' })
  @MaxLength(16, { message: 'Password length must be less than 16 characters' })
  @Matches('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,76}$', '', {
    message:
      'Password should contain at least one uppercase, lowercase and digit',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Match('newPassword')
  confirmPassword: string;
}
