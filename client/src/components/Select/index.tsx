import * as React from 'react';
import { ISize } from '~components/type';
import classnames from 'classnames';

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

  let selectClass = 'select w-full max-w-xs ';

  if (type) {
    selectClass += `select-${type} `;
  }

  if (size) {
    selectClass += `select-${size} `;
  }

  return (
    <select
      className={classnames(selectClass, className)}
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
