import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'כתובת האימייל אינה תקינה' })
  @IsNotEmpty({ message: 'חובה להזין כתובת אימייל' })
  email: string;

  @IsString({ message: 'הסיסמה חייבת להיות מחרוזת' })
  @MinLength(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
  password: string;

  @IsString({ message: 'שם התצוגה חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'חובה להזין שם תצוגה' })
  displayName: string;

  @IsOptional()
  @IsString()
  username?: string;
}
