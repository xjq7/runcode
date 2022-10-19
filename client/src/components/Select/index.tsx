import * as React from 'react';
import { ISize } from '~components/type';
import classnames from 'classnames';
import { useMemo } from 'react';

export interface IOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface Props<T> {
  options?: IOption<T>[];
  value?: T;
  onChange?(t: T): void;
  type?:
    | 'primary'
    | 'secondary'
    | 'warning'
    | 'error'
    | 'success'
    | 'info'
    | 'accent';
  size?: ISize;
  defaultValue?: T;
  style?: React.CSSProperties;
  className?: string;
}

function Component<T = string>(props: Props<T>) {
  const {
    options = [],
    onChange,
    value,
    defaultValue,
    type = 'primary',
    size = 'md',
    style,
    className,
  } = props;

  const typeCls = useMemo(() => {
    switch (type) {
      case 'primary':
        return 'select-primary';
      case 'secondary':
        return 'select-secondary';
      case 'warning':
        return 'select-warning';
      case 'error':
        return 'select-error';
      case 'info':
        return 'select-info';
      case 'success':
        return 'select-success';
      case 'accent':
        return 'select-accent';
    }
  }, [type]);
  const sizeCls = useMemo(() => {
    switch (size) {
      case 'lg':
        return 'select-lg';
      case 'sm':
        return 'select-sm';
      case 'md':
        return 'select-md';
      case 'xs':
        return 'select-xs';
    }
  }, [size]);

  return (
    <select
      className={classnames('select', sizeCls, typeCls, className)}
      onChange={(e) => {
        if (!onChange) return;
        const idx = e.target.selectedIndex;
        onChange(options[idx].value);
      }}
      defaultValue={
        defaultValue as string | number | readonly string[] | undefined
      }
      value={value as string | number | readonly string[] | undefined}
      style={style}
    >
      {options.map((o) => {
        const { label, value: _value, disabled } = o;
        return (
          <option
            value={_value as string | number | readonly string[] | undefined}
            key={label}
            disabled={disabled}
          >
            {label}
          </option>
        );
      })}
    </select>
  );
}

export default Component;
