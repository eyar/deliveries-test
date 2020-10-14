import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { debug } from 'console';
import { getOrmConfig } from '../database/database-ormconfig.constant'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getOrmConfig().secret,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  validate({sub}): Promise<User> {
    return this.authService.verifyPayload(sub);
  }
}
