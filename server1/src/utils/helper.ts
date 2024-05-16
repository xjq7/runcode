import dayjs, { Dayjs } from 'dayjs';
import tar from 'tar-stream';

type rawType = 'Object' | 'Array' | 'Number' | 'String';

export function isType(...args: rawType[]) {
  return (o: unknown) => {
    return args.some(
      (t) => Object.prototype.toString.call(o) === `[object ${t}]`
    );
  };
}
/**
 * 包装 dayjs toISOString 并 +8 hours
 *
 * @export
 * @param {Parameters<typeof dayjs>[0]} date
 * @return {*}
 */
export function wrapDayjs(date: Parameters<typeof dayjs>[0]): Dayjs {
  return dayjs(date).add(8, 'h');
}

export function tarStreamToString(
  stream: NodeJS.ReadableStream
): Promise<string> {
  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    const buf: Buffer[] = [];
    extract.on('entry', function (header, stream, next) {
      stream.on('data', (chunk) => {
        buf.push(chunk);
      });
      stream.on('end', function () {
        next();
      });
      stream.resume();
    });
    extract.on('error', (err) => {
      reject(err);
    });

    extract.on('finish', function () {
      resolve(buf.toString());
    });
    stream.pipe(extract);
  });
}
