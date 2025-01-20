import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Todo, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { SearchTodoDto } from './dto/search-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Logger } from 'winston';
import { ConfigService } from '@nestjs/config';
import { envKey } from '../common/const/env.const';

@Injectable()
export class TodoService {
  private readonly anonymousLimit: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.anonymousLimit = this.configService.get(envKey.anonymousLimit);
  }

  // /todo
  async create(user: User, createTodoDto: CreateTodoDto): Promise<Todo> {
    // 갯수제한 n개
    if (user.username.includes('anonymous')) {
      this.logger.debug('anonymous');
      const todoCount = await this.prisma.todo.count({
        where: { user: { username: user.username } },
      });
      this.logger.debug(todoCount);
      if (todoCount > this.anonymousLimit) {
        throw new BadRequestException('creation limit has been exceeded');
      }
    }
    const { startDate, endDate } = createTodoDto;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate cannot be later than endDate');
    }

    return this.prisma.todo.create({
      data: { ...createTodoDto, user: { connect: { id: user.id } } },
    });
  }

  // read
  // /todo?page=1
  async findAll(user: User, page: number) {
    const limit = 20;
    const todoList = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { userId: user.id },
    });
    const total = await this.prisma.todo.count({ where: { userId: user.id } });
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
  async inProgress(user: User, page: number) {
    const limit = 20;
    const todoList = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isDone: false,
        userId: user.id,
      },
    });
    const total = await this.prisma.todo.count({
      where: { isDone: false, userId: user.id },
    });
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
  async done(user: User, page: number) {
    const limit = 20;
    const todoList = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isDone: true,
        userId: user.id,
      },
    });
    const total = await this.prisma.todo.count({
      where: { isDone: true, userId: user.id },
    });
    const totalPage = Math.ceil(total / limit);

    return {
      todoList,
      total,
      page,
      totalPage,
    };
  }

  // /todo/search?page=1
  async search(user: User, page: number, searchTodoDto: SearchTodoDto) {
    const { keyword, option } = searchTodoDto;
    const limit = 20;

    // 공통 검색 조건
    const baseCondition: Prisma.TodoWhereInput = {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
      AND: [{ userId: user.id }],
    };

    // isDone 조건
    let statusCondition: Prisma.TodoWhereInput | undefined;
    if (option === 'Done') {
      statusCondition = { isDone: true };
    } else if (option === 'In progress') {
      statusCondition = { isDone: false };
    } else {
      statusCondition = undefined;
    }

    // 최종 where 조건
    const where: Prisma.TodoWhereInput = statusCondition
      ? { ...baseCondition, AND: [statusCondition] }
      : baseCondition;

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
  async update(user: User, id: number, updateTodoDto: UpdateTodoDto) {
    const { startDate, endDate } = updateTodoDto;

    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      throw new BadRequestException('startDate cannot be later than endDate');
    }

    return this.prisma.todo.update({
      where: { id: id, userId: user.id },
      data: updateTodoDto,
    });
  }

  // /todo/:id
  async remove(user: User, id: number) {
    try {
      return await this.prisma.todo.delete({
        where: { id: id, userId: user.id },
      });
    } catch (err) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: `Todo with ID ${id} does not exist`,
        details: err.meta,
      });
    }
  }
}
