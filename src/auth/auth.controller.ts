import { Body, Controller, Post } from '@nestjs/common';
// import { SignInDto } from 'src/dtos/sign-in.dto';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //   @Post('/login')
  //   async signIn(@Body() signInDto: SignInDto) {
  //     const response = await this.authService.signIn(signInDto);
  //     return response;
  //   }
}
