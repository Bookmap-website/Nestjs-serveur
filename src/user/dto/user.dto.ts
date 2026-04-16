import { IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;
}
