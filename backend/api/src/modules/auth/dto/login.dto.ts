import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'כתובת האימייל אינה תקינה' })
  @IsNotEmpty({ message: 'חובה להזין כתובת אימייל' })
  email: string;

  @IsString({ message: 'הסיסמה חייבת להיות מחרוזת' })
  @MinLength(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
  password: string;
}
