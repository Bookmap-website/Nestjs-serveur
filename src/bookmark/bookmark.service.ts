import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/createBookmark.dto';
import { EditBookmarkDto } from './dto/editBookmark.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLogsService } from '../adminlogs/adminLogs.service';

@Injectable()
export class BookmarkService {
  constructor(
    private prisma: PrismaService,
    private adminLogsService: AdminLogsService,
  ) {}

  // GET ALL
  getBookmarks_service(userId: string) {
    return this.prisma.bookmark.findMany({ where: { userId } });
  }

  // GET ONE
  async getBookmarkById_service(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  // CREATE
  async createBookmark_service(userId: string, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });

    await this.adminLogsService.createLog({
      action_made:
        'Bookmark - CREATED | id: ' +
        bookmark.id +
        ' | Date: ' +
        new Date().toLocaleString(),
      userId,
    });

    return bookmark;
  }

  // UPDATE
  async editBookmarkById_service(
    userId: string,
    dto: EditBookmarkDto,
    bookmarkId: string,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }

    const updated = await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: dto,
    });

    await this.adminLogsService.createLog({
      action_made: 'Bookmark - UPDATED | id: ' + bookmark.id + ' | Date: ' + new Date().toLocaleString(),
      userId,
    });

    return updated;
  }

  // DELETE
  async deleteBookmarkById_service(userId: string, bookmarkId: string) {
    const deleted = await this.prisma.bookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.adminLogsService.createLog({
      action_made: 'Bookmark - DELETED | id: ' + bookmarkId + ' | Date: ' + new Date().toLocaleString(),
      userId,
    });

    return { message: 'Bookmark deleted successfully' };
  }

  // Gives the number of bookmarks of a user (typically the connected user)
  async nbrBookmarks_service(userId: string) {
    return this.prisma.bookmark.count({
      where: { userId },
    });
  }
}
