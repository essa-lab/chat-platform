import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { IS_PUBLIC_KEY } from 'src/auth/public.decorator';
import { JweService } from 'src/shared/jwe.service';

@Injectable()
export class JweAuthGuard implements CanActivate {
  constructor(private readonly jweService: JweService,private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const auth = req.headers['authorization'] as string | undefined;
    if (!auth) throw new UnauthorizedException('Missing Authorization header');

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException('Invalid Authorization header');

    const token = parts[1];
    let payload: any;
    try {
      payload = await this.jweService.decrypt(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      await this.jweService.verifyPayload(payload);
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Invalid token payload');
    }

    req['user'] = { id: payload.sub, username: payload.username };

    return true;
  }
}
