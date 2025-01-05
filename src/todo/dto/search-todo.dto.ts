import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SearchTodoDto {
  @IsString()
  keyword: string;

  @IsString()
  option: string;

  @IsNumber()
  @IsNotEmpty()
  currentPage: number;
}
