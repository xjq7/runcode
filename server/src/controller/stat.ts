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
      ).format('YYYY-MM-DD HH:mm:ss');
      const endTime = dayjs(dayjs().format('YYYY-MM-DD') + ' 23:59:59').format(
        'YYYY-MM-DD HH:mm:ss'
      );

      const result =
        await prisma.$queryRaw<any>`SELECT * FROM stat WHERE createdAt between ${startTime} and ${endTime}`;
      return {
        code: 0,
        data: {
          list: result.map((o: any) => o),
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
