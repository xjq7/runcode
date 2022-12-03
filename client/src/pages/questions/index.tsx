import classNames from 'classnames';
import { useState } from 'react';
import Input from '~components/Input';
import useList from '~hooks/useList';
import { PageInfo } from '~utils/type';
import styles from './index.module.less';
import { getQuestions, IQuestion } from '~services/question';
import { useDebounceEffect } from 'ahooks';
import Spin from '~components/Spin';
import Pagination from '~components/Pagination';
import Empty from '~components/Empty';
import dayjs from 'dayjs';

function Questions() {
  const [keyword, setKeyword] = useState('');

  const fetchQuestions = (o: PageInfo) => {
    return getQuestions({ page: o.page, pageSize: o.pageSize, keyword });
  };

  const { dataSource, reload, loading, pageInfo, onPageChange } = useList(
    fetchQuestions,
    {
      pageSize: 10,
      autoFetch: false,
    }
  );

  useDebounceEffect(() => {
    reload();
  }, [keyword]);

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
        <Input
          className={classNames('mt-6 mb-3', styles.search)}
          value={keyword}
          placeholder="search question name"
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
        />
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
        <Pagination {...pageInfo} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

export default Questions;
