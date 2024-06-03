import { IsString } from 'nestjs-swagger-dto';

export class StreamDto {
  @IsString()
  name: string;
}
