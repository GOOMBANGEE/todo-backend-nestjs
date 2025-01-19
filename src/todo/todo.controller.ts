import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Logger } from 'winston';
import { CreateTodoDto } from './dto/create-todo.dto';
import { SearchTodoDto } from './dto/search-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';
import { RequestUser } from '../auth/decorator/user.decorator';
import { User } from '@prisma/client';
import { AccessGuard } from '../auth/guard/access.guard';

@Controller('todo')
@UseGuards(AccessGuard)
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  // /todo
  @Post()
  create(@RequestUser() user: User, @Body() createTodoDto: CreateTodoDto) {
    this.logger.debug(user);
    return this.todoService.create(user, createTodoDto);
  }

  // read
  // /todo?page=1
  @Get()
  async findAll(
    @RequestUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return await this.todoService.findAll(user, page);
  }

  // read in-progress
  // /todo/in-progress?page=1
  @Get('in-progress')
  inProgress(
    @RequestUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.inProgress(user, page);
  }

  // read done
  // /todo/done?page=1
  @Get('done')
  done(
    @RequestUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.done(user, page);
  }

  // /todo/search?page=1
  @Post('search')
  search(
    @RequestUser() user: User,
    @Body() searchTodoDto: SearchTodoDto,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.search(user, page, searchTodoDto);
  }

  // /todo/:id
  @Patch(':id')
  update(
    @RequestUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(user, id, updateTodoDto);
  }

  // /todo/:id
  @Delete(':id')
  remove(@RequestUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(user, id);
  }
}
