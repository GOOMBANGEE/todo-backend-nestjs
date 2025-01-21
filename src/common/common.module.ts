import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { PrismaService } from './prisma.service';
import { TasksService } from './tasks.service';

@Module({
  controllers: [CommonController],
  providers: [CommonService, PrismaService, TasksService],
  exports: [PrismaService],
})
export class CommonModule {}
