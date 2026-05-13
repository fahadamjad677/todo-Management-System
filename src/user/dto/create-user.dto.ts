import { IsEmail, IsString, IsNotEmpty, Length, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password!: string;

  @IsUUID()
  roleId!: string;

  @IsUUID()
  departmentId!: string;
}
