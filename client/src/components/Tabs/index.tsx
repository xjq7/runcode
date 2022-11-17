import classNames from 'classnames';
import { useMemo } from 'react';
import { ISize } from '~components/type';

interface Tab<T> {
  label: string;
  value: T;
}

interface Props<T> {
  active?: T;
  size?: ISize;
  tabs: Tab<T>[];
  onChange?(args: T): void;
  boxed?: boolean;
  lifted?: boolean;
  bordered?: boolean;
  className?: string;
}

function Component<T>(props: Props<T>) {
  const {
    tabs = [],
    boxed = false,
    lifted = false,
    bordered = false,
    active = tabs[0],
    size = 'md',
    onChange = () => {},
    className,
  } = props;

  const sizeCls = useMemo(() => {
    switch (size) {
      case 'lg':
        return 'tab-lg';
      case 'sm':
        return 'tab-sm';
      case 'md':
        return 'tab-md';
      case 'xs':
        return 'tab-xs';
    }
  }, [size]);
  return (
    <div
      className={classNames(
        'tabs',
        {
          'tabs-boxed': boxed,
        },
        className
      )}
    >
      {tabs.map((tab) => {
        const { label, value } = tab;

        return (
          <a
            key={label}
            onClick={() => onChange(value)}
            className={classNames('tab', sizeCls, {
              'tab-active': active === value,
              'tab-lifted': lifted,
              'tab-bordered': bordered,
            })}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}

export default Component;
