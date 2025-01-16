import { IsNotEmpty, IsString } from 'class-validator';

export class SearchTodoDto {
  @IsString()
  keyword: string;

  @IsString()
  @IsNotEmpty()
  option: string;
}
