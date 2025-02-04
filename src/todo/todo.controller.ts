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
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('todo')
@UseGuards(AccessGuard)
@ApiBearerAuth('accessToken')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  // /todo
  @Post()
  @ApiBody({ type: CreateTodoDto })
  create(@RequestUser() user: User, @Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(user, createTodoDto);
  }

  // read
  // /todo?page=1
  @Get()
  @ApiQuery({
    name: 'page',
    required: true,
    example: 1,
  })
  async findAll(
    @RequestUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return await this.todoService.findAll(user, page);
  }

  // read in-progress
  // /todo/in-progress?page=1
  @Get('in-progress')
  @ApiQuery({
    name: 'page',
    required: true,
    example: 1,
  })
  inProgress(
    @RequestUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.inProgress(user, page);
  }

  // read done
  // /todo/done?page=1
  @Get('done')
  @ApiQuery({
    name: 'page',
    required: true,
    example: 1,
  })
  done(
    @RequestUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.done(user, page);
  }

  // /todo/search?page=1
  @Post('search')
  @ApiQuery({
    name: 'page',
    required: true,
    example: 1,
  })
  @ApiBody({ type: SearchTodoDto })
  search(
    @RequestUser() user: User,
    @Body() searchTodoDto: SearchTodoDto,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.search(user, page, searchTodoDto);
  }

  // /todo/:id
  @Patch(':id')
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateTodoDto })
  update(
    @RequestUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(user, id, updateTodoDto);
  }

  // /todo/:id
  @Delete(':id')
  @ApiParam({ name: 'id', example: 1 })
  remove(@RequestUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(user, id);
  }
}
