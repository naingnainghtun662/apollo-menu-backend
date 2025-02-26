import { HttpException, Injectable, Logger } from '@nestjs/common';
// import { SignInDto } from 'src/dtos/sign-in.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  //   async signIn(requestData: typeof SignInDto.prototype) {
  //     const { email, password } = requestData;
  //     this.logger.log({ email, password });
  //     const { data, error } = await this.supabaseService
  //       .getClient()
  //       .auth.signInWithPassword({
  //         email,
  //         password,
  //       });
  //     if (error) {
  //       throw new HttpException(error.message, 500);
  //     }

  //     return data;
  //   }

  //   async signOut() {
  //     const response = await this.supabaseService.getClient().auth.signOut();
  //     return response;
  //   }
}
