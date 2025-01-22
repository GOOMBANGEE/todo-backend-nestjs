import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: '1q2w3e4r@' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '1q2w3e4r@' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
