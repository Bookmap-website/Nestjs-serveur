import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminLogDto } from './dto/createAdminLogs.dto';

@Injectable()
export class AdminLogsService {
  constructor(private prisma: PrismaService) {}

  async getAllLogs() {
    return this.prisma.adminLogs.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createLog(dto: CreateAdminLogDto) {
    return this.prisma.adminLogs.create({
      data: {
        action_made: dto.action_made,
        userId: dto.userId,
      },
    });
  }
}