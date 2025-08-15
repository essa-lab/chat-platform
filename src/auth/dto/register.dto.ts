import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
    IsNotEmpty,
  IsOptional,
  IsString,
  Length,

} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })

  @IsNotEmpty()
  @Length(2, 25)
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '*******' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'issa96'})
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Issa Arar' })
  full_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Syria, Damascus' })
  location: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 20 })
  age: Number;

}
