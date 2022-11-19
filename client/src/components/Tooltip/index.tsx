import classNames from 'classnames';
import { PropsWithChildren, useMemo } from 'react';
import { IPosition } from '../type';
interface Props {
  tips?: string;
  className?: string;
  position?: IPosition;
}

function Component(props: PropsWithChildren<Props>) {
  const { children, tips = '', position = 'top', className } = props;

  const positionCls = useMemo(() => {
    switch (position) {
      case 'top':
        return 'tooltip-top';
      case 'bottom':
        return 'tooltip-bottom';
      case 'left':
        return 'tooltip-left';
      case 'right':
        return 'tooltip-right';
    }
  }, [position]);

  return (
    <div
      className={classNames('tooltip', positionCls, className)}
      data-tip={tips}
    >
      {children}
    </div>
  );
}

export default Component;
