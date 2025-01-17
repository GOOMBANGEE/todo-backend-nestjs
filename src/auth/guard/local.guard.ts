import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// {
//     "username":  "test",
//     "password": "password"
// }
@Injectable()
export class LocalGuard extends AuthGuard('local') {}
