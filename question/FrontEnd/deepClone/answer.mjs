export default function deepClone(obj, weakMap = new WeakMap()) {
  const type = Object.prototype.toString.call(obj);
  if (!(type === '[object Object]' || type === '[object Array]')) return obj;
  const o = type === '[object Object]' ? {} : [];
  if (weakMap.get(obj)) return o;
  weakMap.set(obj, true);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      o[key] = deepClone(obj[key], weakMap);
    }
  }
  return o;
}
