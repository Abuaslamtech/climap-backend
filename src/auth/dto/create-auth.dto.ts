export class CreateAuthDto {
  name: string;
  email: string;
  state: string;
  lga: string;
  phone: string;
  password: string;
  confirmpassword: string;
}

export class LoginAuthDto {
  email: string;
  password: string;
}
