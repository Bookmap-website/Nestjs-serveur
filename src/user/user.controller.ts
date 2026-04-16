import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  // Old - ont rentre @Req, puisque ont est en get (attent un retour de la part du sevreur)

  /* New -  ont rentre getuser qui est un decorateur prsonnalisé pour aller chercher l'utilisatueur dans la request a 
   l'aide de la classe User qui est situé dans la database */
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe_service(user);
  }

  @Patch('update')
  updateUser(@GetUser() user: User, @Body() body_request: UserDto) {
    return this.userService.updateUser_service(user.id, body_request);
  }
}
