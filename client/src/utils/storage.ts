interface ISetConfig {
  expires: Date;
}

interface WrapData extends ISetConfig {
  value: any;
}

const storage = {
  set(key: string, value: any, config?: ISetConfig) {
    if (!key || value === null) {
      return null;
    }
    const { expires } = config || {};
    const params = { value, expires };
    localStorage.setItem(key, JSON.stringify(params));
  },
  get(key: string) {
    if (!key) {
      return null;
    }
    const data = localStorage.getItem(key) || '';
    let result = null;
    try {
      const { value, expires } = JSON.parse(data) as WrapData;

      if (expires) {
        const curTime = new Date();
        if (expires <= curTime) {
          this.delete(key);
          return null;
        }
      }
      result = value;
    } catch (error) {}
    return result;
  },

  delete(key: string) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },
};

export default storage;
