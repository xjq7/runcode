import { useEffect, useState } from 'react';
import styles from './index.module.less';
import { getStat, Stat } from './service';
import dayjs from 'dayjs';

function Component() {
  const [stats, setStats] = useState<Stat>({
    stats: { pv: 0, uv: 0 },
    os: [],
  });

  const fetchStat = async () => {
    const startAt = dayjs(dayjs().format('YYYY-MM-DD') + ' 00:00:00').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    const endAt = dayjs(dayjs().format('YYYY-MM-DD') + ' 23:59:59').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    const stats = await getStat({ startAt, endAt });
    setStats(stats);
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
            <div className="stat-value">{stats.stats.pv}</div>
            <div className="stat-desc">今日访问量</div>
          </div>
        </div>
        <div className="stats shadow ml-2">
          <div className="stat w-36">
            <div className="stat-title">UV</div>
            <div className="stat-value">{stats.stats.uv}</div>
            <div className="stat-desc">今日用户量</div>
          </div>
        </div>
      </div>
      <div>
        <div id="os-stats"></div>
      </div>
    </div>
  );
}

export default Component;
