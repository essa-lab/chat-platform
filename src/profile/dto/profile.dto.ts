import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    @ApiProperty({ example:24})
  
  age: number ;

  @IsOptional()
  @Type(() => String)
  @IsString()
    @ApiProperty({ example: "Syria, Damascus" })

  location: string;

  @IsOptional()
  @IsString()
    @ApiProperty({ example: 'Issa Arar' })

  full_name: string;

}
