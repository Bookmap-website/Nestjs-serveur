import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAdminLogDto {
  @IsString()
  @IsNotEmpty()
  action_made: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}