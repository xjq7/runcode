import classNames from 'classnames';
import noop from 'lodash/noop';
import { PropsWithChildren } from 'react';
import { CommonProps } from '../type';

export interface Option {
  label: string;
  value: any;
}

interface Props extends CommonProps {
  options: Option[];
  onChange?(v: Option): void;
  optionStyle?: string;
}

function Component(props: PropsWithChildren<Props>) {
  const { children, optionStyle, options = [], onChange = noop } = props;
  return (
    <div className="dropdown">
      <label tabIndex={0}>{children}</label>
      <ul
        tabIndex={0}
        className={classNames(
          'dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52',
          optionStyle
        )}
      >
        {options.map((option) => {
          return (
            <li
              key={option.value}
              onClick={() => {
                onChange(option);
              }}
            >
              <a>{option.label}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Component;
