import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Post /auth/signup
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() requestDto: AuthDto) {
    return requestDto.email === '' || requestDto.password === ''
      ? { message: 'email or password is required' }
      : this.authService.signup(requestDto);
  }

  // Post /auth/signin
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() requestDto: AuthDto) {
    return requestDto.email === '' || requestDto.password === ''
      ? { message: 'email or password is required' }
      : this.authService.signin(requestDto);
  }

  // Post /auth/checkToken
  @HttpCode(HttpStatus.OK)
  @Get('checkToken')
  checkToken() {
    return this.authService.checkToken();
  }
}
