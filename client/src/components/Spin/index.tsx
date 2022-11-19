import { PropsWithChildren, useEffect, useState } from 'react';
import GridLoader from 'react-spinners/GridLoader';
import styles from './index.module.less';

interface Props {
  loading: boolean;
}

function Component(props: PropsWithChildren<Props>) {
  const { children, loading } = props;

  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoading(loading);
      return;
    }

    setLoading(true);
  }, [loading]);

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loading}>
          <GridLoader
            loading={true}
            size={12}
            color="#570df8"
            className={styles.spinner}
          />
        </div>
      )}
      {children}
    </div>
  );
}

export default Component;
