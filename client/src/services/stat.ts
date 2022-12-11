import request from '~utils/request';

export interface IVisit {
  createdAt: string;
  channel: number;
  source?: string;
}

export function visit(data: IVisit): Promise<{}> {
  return request.post('/stat/visit', data);
}
