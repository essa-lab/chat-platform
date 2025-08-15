import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorBody, ResponseBody } from 'src/common/response-body';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User Information & JWE Token' ,type:ResponseBody})
  @ApiResponse({ status: 400, description: 'Bad Request Error',type:ErrorBody })
  async login(@Body() body:LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 200, description: 'Successful message!' ,type:ResponseBody})
  @ApiResponse({ status: 400, description: 'Bad Request Error',type:ErrorBody })
  async register(@Body() body:RegisterDto) {
    
    const user = await this.authService.register(body);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return new ResponseBody(true,  'User Registerd successfully');
  }
 

}
