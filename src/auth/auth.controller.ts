import { Controller, Post, Body, Logger, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Request() req: { ip?: string },
  ) {
    const user = await this.userService.create(createUserDto);
    this.logger.log(
      `Registro de usuário: ${user.email} | IP: ${req.ip ?? '-'}`,
    );
    return user;
  }

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async login(@Body() loginDto: LoginDto, @Request() req: { ip?: string }) {
    const response = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    this.logger.log(
      `Login bem-sucedido: ${loginDto.email} | IP: ${req.ip ?? '-'}`,
    );
    return response;
  }
}
