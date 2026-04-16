import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard('jwt_user_strategy') {
    constructor() {
        super({
            name: 'jwt_user_strategy',
        });
    }
}