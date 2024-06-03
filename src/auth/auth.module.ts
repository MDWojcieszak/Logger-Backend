import { Module } from '@nestjs/common';
import { AuthController } from './auth.controlles';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RtStrategy } from './strategies';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserService, RtStrategy],
})
export class AuthModule {}
