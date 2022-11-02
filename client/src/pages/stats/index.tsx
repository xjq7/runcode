import { useEffect, useState } from 'react';
import styles from './index.module.less';
import { getStat, Stat } from './service';
import dayjs from 'dayjs';
import { Chart, Util } from '@antv/g2';
import DataSet from '@antv/data-set';

function Component() {
  const [stats, setStats] = useState<Stat>({
    stats: { pv: 0, uv: 0 },
    os: [],
    uv: [],
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
    const data = stats.os || [];

    if (!data.length) return;

    const chart = new Chart({
      container: 'os-stats',
      autoFit: true,
      height: 300,
    });
    chart.data(data);

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
        return {
          offset: -30,
          style: {
            fill: 'white',
            fontSize: 12,
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
          },
          content: (obj) => {
            return obj.type + '\n' + obj.value;
          },
        };
      });

    chart.interaction('element-single-selected');

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [stats]);

  useEffect(() => {
    const data = stats.uv || [];

    if (!data.length) return;

    const ds = new DataSet();

    const chart = new Chart({
      container: 'uv-stats',
      autoFit: true,
      height: 300,
      syncViewPadding: true,
    });

    chart.scale({
      value: {
        sync: true,
        nice: true,
      },
    });

    const dv1 = ds.createView().source(data);
    dv1.transform({
      type: 'map',
      callback: (row) => {
        row.value = row.value;
        row.date = row.date;
        return row;
      },
    });
    const view1 = chart.createView();
    view1.data(dv1.rows);
    view1.axis('date', {});
    view1.axis('value', {
      title: {
        text: '用户量',
      },
    });
    view1.line().position('date*value');

    chart.render();
    return () => {
      chart.destroy();
    };
  }, [stats]);

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <div className="stats shadow">
          <div className="stat w-36">
            <div className="stat-title">PV</div>
            <div className="stat-value">{stats.stats.pv}</div>
            <div className="stat-desc">今日访问量</div>
          </div>
        </div>
        <div className="stats shadow ml-5">
          <div className="stat w-36">
            <div className="stat-title">UV</div>
            <div className="stat-value">{stats.stats.uv}</div>
            <div className="stat-desc">今日用户量</div>
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <div className="w-1/2">
          <div className="mb-3">访问设备统计</div>
          <div id="os-stats"></div>
        </div>

        <div className="w-1/2">
          <div className="mb-6">近三天用户访问统计</div>
          <div id="uv-stats"></div>
        </div>
      </div>
    </div>
  );
}

export default Component;
