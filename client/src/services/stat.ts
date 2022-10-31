import request from '~utils/request';

interface IVisit {
  createdAt: string;
}

export function visit(data: IVisit): Promise<{}> {
  return request.post('/stat/visit', data);
}
