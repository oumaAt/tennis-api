import { Transform } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class FindPlayerByIdDto {
  @Transform(({ value }) => Number(value)) 
  @IsInt()
  @IsPositive()
  id: number;
}
