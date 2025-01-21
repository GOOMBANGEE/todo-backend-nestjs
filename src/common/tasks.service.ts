import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { envKey } from './const/env.const';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly anonymousDateLimit: number;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.anonymousDateLimit = this.configService.get(envKey.anonymousDateLimit);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'Asia/Seoul' })
  async schedule() {
    // anonymous의 username을 가진 유저중, createdAt이 n일 이상 지난경우
    // user삭제 => cascade todo 삭제
    const refDate = new Date();
    refDate.setDate(refDate.getDate() - this.anonymousDateLimit);

    const result = await this.prismaService.user.deleteMany({
      where: {
        username: { startsWith: 'anonymous' },
        createdAt: { lte: refDate },
      },
    });

    this.logger.debug(
      `Deleted ${result.count} users with usernames starting with 'anonymous' and createdAt older than ${refDate}.`,
    );

    // let userIdList: number[] = [];
    // await this.prismaService.$transaction(async (prisma) => {
    //   const usersToDelete = await prisma.user.findMany({
    //     where: {
    //       username: { startsWith: 'anonymous' },
    //       createdAt: { lte: refDate },
    //     },
    //   });
    //   userIdList = usersToDelete.map((user) => user.id);
    //
    //   await prisma.todo.deleteMany({
    //     where: { userId: { in: userIdList } },
    //   });
    //
    //   await prisma.user.deleteMany({
    //     where: { id: { in: userIdList } },
    //   });
    // });
    //
    // this.logger.debug(
    //   `Deleted ${userIdList.length} users with usernames starting with 'anonymous' and createdAt older than ${refDate}.`,
    // );
  }
}
