import { Get, JsonController, Post } from 'routing-controllers';
import { redisStore } from '../config/redis';
import { Ip } from '../middleware/decorator/Ip';
import prisma from '../config/prisma';
import IP2Region from 'ip2region';
import dayjs from 'dayjs';

const IP_PREFIX = 'ip_';

@JsonController('/stat')
export class StatController {
  @Get('/')
  async getStat() {
    try {
      const startTime = dayjs(
        dayjs().format('YYYY-MM-DD') + ' 00:00:00'
      ).toISOString();
      const endTime = dayjs(
        dayjs().format('YYYY-MM-DD') + ' 23:59:59'
      ).toISOString();

      const result = await prisma.stat.findMany({
        where: { createdAt: { lte: endTime, gte: startTime } },
      });

      return {
        code: 0,
        data: {
          list: result,
        },
      };
    } catch (error) {
      return {
        code: 0,
        data: {
          list: [],
        },
      };
    }
  }

  @Post('/visit')
  async visit(@Ip() ip: string) {
    if (!ip) {
      return {
        code: 0,
      };
    }

    try {
      const ipCache = await redisStore.get(IP_PREFIX + ip);

      if (ipCache !== null) {
        return {
          code: 0,
        };
      }

      const query = new IP2Region();
      const region = query.search(ip);
      const { country, city, province, isp } = region ?? {};

      await redisStore.set(IP_PREFIX + ip, '1');
      await redisStore.expire(IP_PREFIX + ip, 600);

      await prisma.stat.create({
        data: {
          ip,
          country,
          city,
          province,
          isp,
        },
      });
    } catch (error) {
      return {
        code: 0,
        message: JSON.stringify(error),
      };
    }

    return {
      code: 0,
      message: 'success!',
    };
  }
}
