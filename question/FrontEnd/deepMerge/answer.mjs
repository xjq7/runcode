function getType(o) {
  return Object.prototype.toString.call(o);
}

function deepClone(obj, weakMap = new WeakMap()) {
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

export default function deepMerge(a, b) {
  if (getType(a) !== '[object Object]' && getType(a) !== '[object Array]') {
    return deepClone(b);
  }

  const isArray = getType(a) === '[object Array]';
  const res = isArray ? [] : {};
  for (const key in b) {
    if (b.hasOwnProperty(key)) {
      res[key] = deepMerge(a[key], b[key]);
    }
  }
  for (const key in a) {
    if (res[key] === undefined && a.hasOwnProperty(key)) {
      res[key] = deepClone(a[key]);
    }
  }
  return res;
}
