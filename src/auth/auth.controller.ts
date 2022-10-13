import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthDto } from './dto';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
  }),
) // ValidationPipe doesnt work with aoo.useGlobalPipes
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
