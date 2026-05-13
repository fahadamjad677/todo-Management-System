import { IsEmail, IsString, IsNotEmpty, Length, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name?: string;

  @IsUUID()
  roleId?: string;

  @IsUUID()
  departmentId?: string;
}
