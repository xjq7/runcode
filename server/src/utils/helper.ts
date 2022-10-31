import dayjs from 'dayjs';

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
export function getISOString(date: Parameters<typeof dayjs>[0]) {
  return dayjs(date).add(8, 'h').toISOString();
}
