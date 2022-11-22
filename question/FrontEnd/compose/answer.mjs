export default function compose(...args) {
  if (args.length === 0) return (x) => x;
  if (args.length === 1) return args[0];
  return args.reduce(
    (acc, cur) =>
      (...args) =>
        acc(cur(...args))
  );
}
