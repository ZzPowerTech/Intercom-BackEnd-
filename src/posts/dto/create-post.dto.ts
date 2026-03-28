import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  subtitle?: string;

  @IsString()
  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  @MaxLength(50000)
  content: string;

  @IsString()
  @IsOptional()
  authorId?: string;
}
