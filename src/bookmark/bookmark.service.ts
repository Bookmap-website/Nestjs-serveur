import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/createBookmark.dto';
import { EditBookmarkDto } from './dto/editBookmark.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks_service(userId: string) {
    return this.prisma.bookmark.findMany({ where: { userId } });
  }

  async getBookmarkById_service(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  createBookmark_service(userId: string, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: { ...dto, user: { connect: { id: userId } } },
    });
  }

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

    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: dto,
    });
  }

  async deleteBookmarkById_service(userId: string, bookmarkId: string) {
    const deleted = await this.prisma.bookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId: userId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Bookmark not found');
    }

    return { message: 'Bookmark deleted successfully' };
  }

  async nbrBookmarks_service(userId: string) {
    const count = await this.prisma.bookmark.count({
      where: { userId },
    });

    return count;
  }
}
