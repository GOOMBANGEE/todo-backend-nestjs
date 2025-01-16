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
} from '@nestjs/common';
import { Logger } from 'winston';
import { CreateTodoDto } from './dto/create-todo.dto';
import { SearchTodoDto } from './dto/search-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  // /todo
  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  // read
  // /todo?page=1
  @Get()
  async findAll(@Query('page', ParseIntPipe) page: number = 1) {
    return await this.todoService.findAll(page);
  }

  // read in-progress
  // /todo/in-progress?page=1
  @Get('in-progress')
  inProgress(@Query('page', ParseIntPipe) page: number = 1) {
    return this.todoService.inProgress(page);
  }

  // read done
  // /todo/done?page=1
  @Get('done')
  done(@Query('page', ParseIntPipe) page: number = 1) {
    return this.todoService.done(page);
  }

  // /todo/search?page=1
  @Post('search')
  search(
    @Body() searchTodoDto: SearchTodoDto,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.todoService.search(page, searchTodoDto);
  }

  // /todo/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(id, updateTodoDto);
  }

  // /todo/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.remove(id);
  }
}
