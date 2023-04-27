import classNames from 'classnames';
import useList from '~hooks/useList';
import { PageInfo } from '~utils/type';
import styles from './index.module.less';
import { getQuestions, IQuestion } from '~services/question';
import Spin from '~components/Spin';
import Empty from '~components/Empty';
import dayjs from 'dayjs';

function Questions() {
  const fetchQuestions = (o: PageInfo) => {
    return getQuestions();
  };

  const { dataSource, loading } = useList(fetchQuestions, {
    autoFetch: false,
  });

  const Item = (item: IQuestion) => {
    return (
      <div
        className={styles.item}
        onClick={() => {
          window.open(`/question?name=${item.name}`, '_blank');
        }}
      >
        <p className={classNames('text-black', styles.title)}>{item.name}</p>
        <p className={classNames('text-black', styles.desc)}>{item.desc}</p>
        <p className={classNames('text-gray-500', styles.createdAt)}>
          创建时间: {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Spin loading={loading}>
          <div className={styles.list}>
            {dataSource.length !== 0 ? (
              <>
                {dataSource.map((o) => (
                  <Item key={o.name} {...o} />
                ))}
              </>
            ) : (
              <Empty />
            )}
          </div>
        </Spin>
      </div>
    </div>
  );
}

export default Questions;
