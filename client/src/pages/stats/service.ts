import request from '~utils/request';

export function visit(): Promise<{}> {
  return request.post('/stat/visit');
}

export interface OsStat {
  type: string;
  value: number;
}
export interface UvStat {
  date: string;
  value: number;
}

export interface SourceStat {
  type: string;
  value: number;
}

export interface ChannelStat {
  type: string;
  value: number;
}

export interface RegionStat {
  type: string;
  value: number;
}
export interface Stat {
  stats: { pv: number; uv: number };
  os: OsStat[];
  uv: UvStat[];
  province: RegionStat[];
  city: RegionStat[];
  country: RegionStat[];
  source: SourceStat[];
  channel: ChannelStat[];
}

export interface IStatRequest {
  startAt: string;
  endAt: string;
}

export function getStat(params: IStatRequest): Promise<Stat> {
  return request.get('/stat', { params });
}
