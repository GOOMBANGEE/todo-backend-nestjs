import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Todo } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { SearchTodoDto } from './dto/search-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  // /todo
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const { startDate, endDate } = createTodoDto;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate cannot be later than endDate.');
    }

    return await this.prisma.todo.create({ data: createTodoDto });
  }

  // read
  // /todo?page=1
  async findAll(page: number) {
    const limit = 20;
    const todoList = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await this.prisma.todo.count();
    const totalPage = Math.ceil(total / limit);

    return {
      todoList,
      total,
      page,
      totalPage,
    };
  }

  // read in-progress
  // /todo/in-progress?page=1
  async inProgress(page: number) {
    const limit = 20;
    const todoList = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isDone: false,
      },
    });
    const total = await this.prisma.todo.count({ where: { isDone: false } });
    const totalPage = Math.ceil(total / limit);

    return {
      todoList,
      total,
      page,
      totalPage,
    };
  }

  // read done
  // /todo/done?page=1
  async done(page: number) {
    const limit = 20;
    const todoList = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isDone: true,
      },
    });
    const total = await this.prisma.todo.count({ where: { isDone: true } });
    const totalPage = Math.ceil(total / limit);

    return {
      todoList,
      total,
      page,
      totalPage,
    };
  }

  // /todo/search?page=1
  async search(page: number, searchTodoDto: SearchTodoDto) {
    const { keyword, option } = searchTodoDto;
    const limit = 20;

    let where: any = {};
    if (option === 'title') {
      where = { title: { contains: keyword, mode: 'insensitive' } };
    } else if (option === 'description') {
      where = { description: { contains: keyword, mode: 'insensitive' } };
    } else if (option === '') {
      where = {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      };
    }

    const [todoList, total] = await Promise.all([
      this.prisma.todo.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      this.prisma.todo.count({ where }),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
      todoList,
      total,
      page,
      totalPage,
    };
  }

  // /todo/:id
  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const { startDate, endDate } = updateTodoDto;

    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      throw new BadRequestException('startDate cannot be later than endDate.');
    }

    return await this.prisma.todo.update({
      where: { id: id },
      data: updateTodoDto,
    });
  }

  // /todo/:id
  async remove(id: number) {
    try {
      return await this.prisma.todo.delete({ where: { id: id } });
    } catch (err) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: `Todo with ID ${id} does not exist.`,
        details: err.meta,
      });
    }
  }
}
