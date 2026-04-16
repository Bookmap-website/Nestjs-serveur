import { Controller, Delete, Get, Param, Patch, Post, UseGuards, Body, HttpCode } from "@nestjs/common";
import { BookmarkService } from "./bookmark.service";
import { JwtGuard } from "../auth/guard/jwt.guard";
import { GetUser } from "../auth/decorator/getUser.decorator";
import { CreateBookmarkDto } from "./dto/createBookmark.dto";
import { EditBookmarkDto } from "./dto/editBookmark.dto";


@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}


    @Get('getBookmarks')
    getBookmarks(@GetUser('id') userId : string) {
        return this.bookmarkService.getBookmarks_service(userId);
    }

    @Get('getBookmarkById/:id')
    getBookmarkById(@GetUser('id') userId : string, @Param('id') bookmarkId : string) {
        return this.bookmarkService.getBookmarkById_service(userId, bookmarkId);
    }

    @HttpCode(200)
    @Post('createBookmark')
    createBookmark(@GetUser('id') userId : string, @Body() dto : CreateBookmarkDto) {
        return this.bookmarkService.createBookmark_service(userId, dto);
    }

    @Patch('editBookmarkById/:id')
    editBookmarkById(@GetUser('id') userId : string, @Body() dto : EditBookmarkDto, @Param('id') bookmarkId : string) {
        return this.bookmarkService.editBookmarkById_service(userId, dto, bookmarkId);
    }
    
    @Delete('deleteBookmarkById/:id')
    deleteBookmarkById(@GetUser('id') userId : string, @Param('id') bookmarkId : string) {
        return this.bookmarkService.deleteBookmarkById_service(userId, bookmarkId);
    }
}