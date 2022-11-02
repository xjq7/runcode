import {
  BodyParam,
  Get,
  HeaderParam,
  JsonController,
  Post,
  QueryParam,
} from 'routing-controllers';
import { redisStore } from '../config/redis';
import { Ip } from '../middleware/decorator/Ip';
import prisma from '../config/prisma';
import IP2Region from 'ip2region';
import logger from '../logger';
import uaparser from 'ua-parser-js';
import { stat } from '@prisma/client';
import { uniqBy } from 'lodash';
import { wrapDayjs } from '../utils/helper';

const IP_PREFIX = 'ip_';

interface StatRes extends stat {
  os: string;
}

@JsonController('/stat')
export class StatController {
  @Get('/')
  async getStat(
    @QueryParam('startAt', { required: true }) startAt: string,
    @QueryParam('endAt', { required: true }) endAt: string
  ) {
    logger.info('/stat GET query startAt: %s ,endAt: %s', startAt, endAt);
    try {
      const list = await prisma.stat.findMany({
        where: {
          createdAt: {
            lte: wrapDayjs(endAt).toISOString(),
            gte: wrapDayjs(startAt).toISOString(),
          },
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });

      const uniqList = uniqBy(list, (x) => x.ip);
      const uv = uniqList.length;
      const pv = list.length;

      const parseList = uniqList.map((o) => {
        const ua = uaparser(o.userAgent ?? '');
        const browser = ua?.browser?.name ?? '未知';
        const os = ua?.os?.name ?? '未知';
        const device = ua?.device?.model ?? '未知';
        const engine = ua?.engine?.name ?? '未知';
        return { ...o, browser, os, device, engine };
      }) as StatRes[];

      const osStats = parseList.reduce<Record<string, number>>((acc, cur) => {
        const { os } = cur;
        if (!os) return acc;
        if (!acc[os]) {
          acc[os] = 1;
        } else {
          acc[os]++;
        }
        return acc;
      }, {});
      const list7 = await prisma.stat.findMany({
        where: {
          createdAt: {
            lte: wrapDayjs(endAt).toISOString(),
            gte: wrapDayjs(endAt).subtract(3, 'd').add(1, 's').toISOString(),
          },
        },
        distinct: ['ip'],
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });

      interface UvStat {
        date: string;
        value: number;
      }

      const uvStats: UvStat[] = [
        { date: wrapDayjs(endAt).format('YYYY-MM-DD'), value: 0 },

        {
          date: wrapDayjs(endAt).subtract(1, 'd').format('YYYY-MM-DD'),
          value: 0,
        },
        {
          date: wrapDayjs(endAt).subtract(2, 'd').format('YYYY-MM-DD'),
          value: 0,
        },
      ];

      list7.forEach((stat) => {
        const { createdAt } = stat;
        const diff = wrapDayjs(endAt).diff(createdAt, 'd');
        uvStats[diff].value++;
      });

      return {
        code: 0,
        data: {
          stats: {
            uv,
            pv,
          },
          os: Object.entries(osStats).map(([os, value]) => ({
            type: os,
            value,
          })),
          uv: uvStats,
        },
      };
    } catch (error) {
      logger.error('stats 查询出错', JSON.stringify(error));
      return {
        code: 1,
        message: JSON.stringify(error),
      };
    }
  }

  @Post('/visit')
  async visit(
    @Ip() ip: string,
    @HeaderParam('User-Agent') userAgent: string,
    @BodyParam('createdAt', { required: true }) createdAt: string
  ) {
    logger.info('/visit POST body createdAt: %s', createdAt);
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
          createdAt: wrapDayjs(createdAt).toISOString(),
        },
      });
    } catch (error) {
      logger.error(`visit error, ${JSON.stringify(error)}`);
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
