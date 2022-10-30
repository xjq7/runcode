import { uniqBy } from 'lodash';
import { useEffect, useState } from 'react';
import styles from './index.module.less';
import { getStat } from './service';

function Component() {
  const [stats, setStats] = useState({
    pv: 0,
    uv: 0,
  });

  const fetchStat = async () => {
    const { list } = await getStat();

    const uv = uniqBy(list, (x) => x.ip).length;

    const pv = list.length;
    setStats({ uv, pv });
  };
  useEffect(() => {
    fetchStat();
  }, []);
  return (
    <div className={styles.container}>
      <div>
        <div className="stats shadow">
          <div className="stat w-36">
            <div className="stat-title">PV</div>
            <div className="stat-value">{stats.pv}</div>
            <div className="stat-desc">今日访问量</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat w-36">
            <div className="stat-title">UV</div>
            <div className="stat-value">{stats.uv}</div>
            <div className="stat-desc">今天用户</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
