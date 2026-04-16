import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt_user_strategy',
) {
  constructor(private prisma: PrismaService) {
    // gets the secret passed in the .env file and throw an error if it's not defined
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret!,
    });
  }

  // function is absolutely needed, Passportstrategy requires it to validate the token and extract the payload
  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
        where : { id: payload.sub },
    })
    // remove the hash from the user object before returning it
    const { hash, ...userWithoutHash } = user!;
    return userWithoutHash;
  }
}
