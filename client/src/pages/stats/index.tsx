import { uniqBy } from 'lodash';
import { useEffect, useState } from 'react';
import styles from './index.module.less';
import { getStat, Stat } from './service';
import { Chart, Util } from '@antv/g2';
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

  useEffect(() => {
    return;
    const chart = new Chart({
      container: 'container',
      autoFit: true,
      height: 500,
    });
    chart.data(stats.os);

    chart.coordinate('theta', {
      radius: 0.75,
    });
    chart.tooltip({
      showMarkers: false,
    });

    const interval = chart
      .interval()
      .adjust('stack')
      .position('value')
      .color('type', ['#063d8a', '#1770d6', '#47abfc', '#38c060'])
      .style({ opacity: 0.4 })
      .state({
        active: {
          style: (element) => {
            const shape = element.shape;
            return {
              matrix: Util.zoom(shape, 1.1),
            };
          },
        },
      })
      .label('type', (val) => {
        const opacity = val === '四线及以下' ? 1 : 0.5;
        return {
          offset: -30,
          style: {
            opacity,
            fill: 'white',
            fontSize: 12,
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
          },
          content: (obj) => {
            return obj.type + '\n' + obj.value + '%';
          },
        };
      });

    chart.interaction('os-stats');

    chart.render();
  }, [stats]);
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
