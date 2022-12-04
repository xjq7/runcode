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
import { Channel, ChannelText } from '../utils/type';

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

      const [osStats, countryStats, provinceStats, cityStats] =
        parseList.reduce<
          [
            Record<string, number>,
            Record<string, number>,
            Record<string, number>,
            Record<string, number>
          ]
        >(
          (acc, cur) => {
            const { os, country, province, city } = cur;
            if (os) {
              if (!acc[0][os]) {
                acc[0][os] = 1;
              } else {
                acc[0][os]++;
              }
            }

            [country, province, city].forEach((value, index) => {
              const idx = index + 1;
              if (!value) value = '未知';
              if (!acc[idx][value]) {
                acc[idx][value] = 1;
              } else {
                acc[idx][value]++;
              }
            });

            return acc;
          },
          [{}, {}, {}, {}]
        );
      const list7 = await prisma.stat.findMany({
        where: {
          createdAt: {
            lte: wrapDayjs(endAt).toISOString(),
            gte: wrapDayjs(endAt).subtract(3, 'd').add(1, 's').toISOString(),
          },
        },
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

      const source: Record<string, number> = {};
      const ipSet = new Set();

      list7.reverse().forEach((stat) => {
        const { createdAt, channel, ip } = stat;
        const diff = wrapDayjs(endAt).diff(createdAt, 'd');
        uvStats[diff].value++;

        const curCount = source[ChannelText[channel as Channel]];
        if (curCount) {
          source[ChannelText[channel as Channel]]++;
        } else {
          source[ChannelText[channel as Channel]] = 1;
        }

        ipSet.add(ip);
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
          province: Object.entries(provinceStats).map(([province, value]) => ({
            type: province,
            value,
          })),
          country: Object.entries(countryStats).map(([country, value]) => ({
            type: country,
            value,
          })),
          city: Object.entries(cityStats).map(([city, value]) => ({
            type: city,
            value,
          })),
          source: Object.entries(source).map(([key, value]) => ({
            type: key,
            value,
          })),
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
    @BodyParam('createdAt', { required: true }) createdAt: string,
    @BodyParam('channel') channel: number
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
          message: '缓存中',
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
          channel,
          createdAt: wrapDayjs(createdAt).toISOString(),
        },
      });
    } catch (error: any) {
      logger.error(`visit error, ${error?.message}`);
      return {
        code: 0,
        message: error?.message,
      };
    }

    logger.info(`ip: ${ip}, visit`);

    return {
      code: 0,
      message: 'success!',
    };
  }
}
