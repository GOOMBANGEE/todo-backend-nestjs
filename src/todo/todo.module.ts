import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
