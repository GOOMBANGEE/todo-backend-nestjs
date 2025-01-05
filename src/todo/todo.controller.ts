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
  // /todo
  @Get()
  async findAll(currentPage: number = 1) {
    return await this.todoService.findAll(currentPage);
  }

  // read pending
  // /todo/pending
  @Get('pending')
  pending(currentPage: number = 1) {
    return this.todoService.pending(currentPage);
  }

  // read done
  // /todo/done
  @Get('done')
  done(currentPage: number = 1) {
    return this.todoService.done(currentPage);
  }

  // /todo/search
  @Post('search')
  search(@Body() searchTodoDto: SearchTodoDto) {
    return this.todoService.search(searchTodoDto);
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
