type rawType = 'Object' | 'Array' | 'Number' | 'String';

export function isType(...args: rawType[]) {
  return (o: unknown) => {
    return args.some(
      (t) => Object.prototype.toString.call(o) === `[object ${t}]`
    );
  };
}
