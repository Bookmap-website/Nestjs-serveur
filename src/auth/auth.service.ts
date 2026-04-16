import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // sign token
  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      // JWT standard fields for a unique identifier of the user and the email
      sub: userId,
      email,
    };

    // sign token with the payload and return it
    const token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    return { access_token: token };
  }

  async signup(requestdto: AuthDto) {
    // generate password hash
    const hash = await argon2.hash(requestdto.password);
    // save new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: requestdto.email,
          hash: hash,
        },
        // retourne seulement c'est champs
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return { access_token: await this.signToken(user.id, user.email) };
    } catch (error) {
      throw new ForbiddenException('Invalid Crendentials');
    }
  }

  // Same DTO because login and register are litterally using the same interface
  async signin(dto: AuthDto) {
    // look up user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email},
    });

    // if nobody found, throw exception
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // compare passwords from the user request and the db
    const pwMatches = await argon2.verify(user.hash, dto.password);

    // if they don't match, throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    // return the user filtered without the hash
    // const { hash, ...userWithoutPassword } = user;

    // return the JWT token
    return await this.signToken(user.id, user.email);
  }

  // Checls token

  async checkToken() {
    return { message: 'ok' };
  }
}
