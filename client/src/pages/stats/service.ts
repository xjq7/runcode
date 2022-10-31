import request from '~utils/request';

export function visit(): Promise<{}> {
  return request.post('/stat/visit');
}

export function getStat(): Promise<{ list: any[] }> {
  return request.get('/stat');
}
