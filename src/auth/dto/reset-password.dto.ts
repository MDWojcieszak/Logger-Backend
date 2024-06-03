import { IsString } from 'nestjs-swagger-dto';

export class ResetPasswordDto {
  @IsString()
  newPassword: string;
}
