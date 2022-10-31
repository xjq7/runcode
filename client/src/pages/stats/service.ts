import request from '~utils/request';

export function visit(): Promise<{}> {
  return request.post('/stat/visit');
}

export interface OsStat {
  type: string;
  value: number;
}

export interface Stat {
  stats: { pv: number; uv: number };
  os: OsStat[];
}

export interface IStatRequest {
  startAt: string;
  endAt: string;
}

export function getStat(params: IStatRequest): Promise<Stat> {
  return request.get('/stat', { params });
}
