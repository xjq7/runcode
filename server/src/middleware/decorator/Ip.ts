import { createParamDecorator } from 'routing-controllers';

export function Ip() {
  return createParamDecorator({
    required: false,
    value: (action) => {
      const req = action.request;
      const headers = action.request.header;
      let ip =
        headers['x-forwarded-for'] ||
        headers['X-Real-IP'] ||
        req.ip ||
        req.connection?.remoteAddress || // 判断 connection 的远程 IP
        req.socket?.remoteAddress || // 判断后端的 socket 的 IP
        req.connection?.socket?.remoteAddress ||
        '';
      if (ip) {
        ip = ip.replace('::ffff:', '');
      }

      return ip;
    },
  });
}
