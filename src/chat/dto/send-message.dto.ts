import { IsOptional, IsInt, Min, Max, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  message: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  senderId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  recipientId: number|null = null;


}
