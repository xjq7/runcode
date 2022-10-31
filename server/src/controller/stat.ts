import { Get, HeaderParam, JsonController, Post } from 'routing-controllers';
import { redisStore } from '../config/redis';
import { Ip } from '../middleware/decorator/Ip';
import prisma from '../config/prisma';
import IP2Region from 'ip2region';
import dayjs from 'dayjs';
import logger from '../logger';
import uaparser from 'ua-parser-js';

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

      let list = await prisma.stat.findMany({
        where: { createdAt: { lte: endTime, gte: startTime } },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });
      console.time();
      list = list.map((o) => {
        if (!o.userAgent) return o;
        const ua = uaparser(o.userAgent);
        const browser = ua?.browser?.name ?? '未知';
        const os = ua?.os?.name ?? '未知';
        const device = ua?.device?.model ?? '未知';
        const engine = ua?.engine?.name ?? '未知';
        return { ...o, browser, os, device, engine };
      });
      console.timeEnd();

      return {
        code: 0,
        data: {
          list,
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
  async visit(@Ip() ip: string, @HeaderParam('User-Agent') userAgent: string) {
    if (!ip) {
      return {
        code: 0,
      };
    }
    try {
      const ipCache = await redisStore.get(IP_PREFIX + ip);

      logger.info(`ip: ${ip}, 存在缓存，跳过 visit`);

      if (ipCache !== null) {
        return {
          code: 0,
        };
      }

      const query = new IP2Region();
      const region = query.search(ip);
      const { country, city, province, isp } = region ?? {};

      await redisStore.set(IP_PREFIX + ip, '1');
      await redisStore.expire(IP_PREFIX + ip, 60);

      await prisma.stat.create({
        data: {
          ip,
          country,
          city,
          province,
          isp,
          userAgent,
        },
      });
    } catch (error) {
      logger.info(`visit error, ${JSON.stringify(error)}`);
      return {
        code: 0,
        message: JSON.stringify(error),
      };
    }

    logger.info(`ip: ${ip}, visit`);

    return {
      code: 0,
      message: 'success!',
    };
  }
}
