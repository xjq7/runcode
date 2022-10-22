import classNames from 'classnames';
import { PropsWithChildren } from 'react';

interface Props {
  tips?: string;
  className?: string;
}

function Component(props: PropsWithChildren<Props>) {
  const { children, tips = '', className } = props;
  return (
    <div className={classNames('tooltip', className)} data-tip={tips}>
      {children}
    </div>
  );
}

export default Component;
