import {
  Controller,
  Get,
  Post,
  Body,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { AdminLogsService } from './adminLogs.service';
import { JwtGuard } from '../auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('adminLogs')
export class AdminLogsController {
  constructor(private readonly adminLogsService: AdminLogsService) {}

  // get all logs for the user if he is connected as an admin
  @Get('getLogs')
  getLogs(@GetUser() user: any) {
    if (!user?.isAdmin) {
      // log the attempt for the admin
      this.adminLogsService.createLog({
        action_made: `UNAUTHORIZED ACCESS ATTEMPT to admin logs by userId=${user?.id ?? 'unknown'} email=${user?.email ?? 'unknown'}`,
        userId: user?.id ?? 'unknown',
      });

      throw new ForbiddenException('Admin only');
    }

    return this.adminLogsService.getAllLogs();
  }
}
