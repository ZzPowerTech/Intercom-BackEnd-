import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @Matches(/@minha\.fag\.edu\.br$/, {
    message: 'O email deve ser institucional (@minha.fag.edu.br)',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
