import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchTodoDto {
  @ApiProperty({ example: 'keyword' })
  @IsString()
  keyword: string;

  @ApiProperty({ example: 'all' })
  @IsString()
  @IsNotEmpty()
  option: string;
}
