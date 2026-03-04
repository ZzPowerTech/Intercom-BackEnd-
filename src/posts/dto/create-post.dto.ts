import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: 'O authorId é obrigatório' })
  authorId: string;
}
