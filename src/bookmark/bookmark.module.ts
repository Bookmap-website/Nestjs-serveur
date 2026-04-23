import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarkController } from './bookmark.controller';
import { LogsModule } from '../adminlogs/adminLogs.module';

@Module({
  imports: [LogsModule],
  controllers: [BookmarkController],
  providers: [BookmarkService, PrismaService],
})
export class BookmarkModule {}
