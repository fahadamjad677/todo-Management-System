import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  name!: string;
}
