import request from '~utils/request';

export function visit(): Promise<{}> {
  return request.post('/stat/visit');
}
