import classNames from 'classnames';
import { useState } from 'react';
import Input from '~components/Input';
import useList from '~hooks/useList';
import { PageInfo } from '~utils/type';
import styles from './index.module.less';
import { getQuestions, IQuestion } from '~services/question';
import { useDebounceEffect } from 'ahooks';
import PageSpinner from '~components/PageSpinner';

function Questions() {
  const [keyword, setKeyword] = useState('');

  const fetchQuestions = (o: PageInfo) => {
    return getQuestions({ page: o.page, pageSize: o.pageSize, keyword });
  };

  const { dataSource, reload, loading } = useList(fetchQuestions, {
    pageSize: 100,
  });

  useDebounceEffect(() => {
    if (keyword) {
      reload();
    }
  }, [keyword]);

  const Item = (item: IQuestion) => {
    return (
      <div
        className={styles.item}
        onClick={() => {
          window.open(`/question?name=${item.name}`);
        }}
      >
        <p className={classNames('text-black', styles.title)}>{item.name}</p>
        <p className={classNames('text-gray-400', styles.desc)}>{item.desc}</p>
      </div>
    );
  };

  if (loading) return <PageSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Input
          className={classNames('mt-6 mb-3', styles.search)}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
        />
        <div className={styles.list}>
          {dataSource.map((o) => (
            <Item key={o.name} {...o} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Questions;
