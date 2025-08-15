import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
    IsNotEmpty,
  IsString,

} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '*******' })
  password: string;
}
