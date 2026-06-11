import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  state: string;

  @IsString()
  lga: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
