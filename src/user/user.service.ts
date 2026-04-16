import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe_service(user: User) {
    return this.prisma.user.findUnique({
      where: { email: user.email, id: user.id },
    });
  }

  async updateUser_service(user: string, body_request: UserDto) {
    if ('email' in body_request || 'id' in body_request) {
      throw new ForbiddenException('Email or id cannot be updated');
    }

    return this.prisma.user.update({
      where: { id: user },
      data: body_request,
    });
  }
}
