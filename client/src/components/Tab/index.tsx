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
}

function Component<T>(props: Props<T>) {
  const {
    tabs = [],
    boxed = false,
    lifted = false,
    bordered = false,
    active = tabs[0],
    onChange = () => {},
  } = props;

  return (
    <div
      className={classNames('tabs', {
        'tabs-boxed': boxed,
      })}
    >
      {tabs.map((tab) => {
        const { label, value } = tab;

        return (
          <a
            key={label}
            onClick={() => onChange(value)}
            className={classNames('tab', {
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
