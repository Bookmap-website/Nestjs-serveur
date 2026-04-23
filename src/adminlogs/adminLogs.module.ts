import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLogsController } from './adminlogs.controller';
import { AdminLogsService } from './adminLogs.service';

@Module({
  controllers: [AdminLogsController],
  providers: [AdminLogsService, PrismaService],
  exports: [AdminLogsService],
})
export class LogsModule {}
