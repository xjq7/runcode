export function CatchError() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;
    descriptor.value = function (...args: any) {
      try {
        return fn.apply(this, args);
      } catch (error: any) {
        return {
          code: 1,
          message: error.message,
        };
      }
    };
  };
}
