import classNames from 'classnames';
import noop from 'lodash/noop';
import { CommonProps } from '../type';

export interface IOption {
  label: string;
  value: any;
}

interface Props extends CommonProps {
  options: IOption[];
  value: any;
  onClick?(args: any): void;
}

function Component(props: Props) {
  const { className, value, options, onClick = noop } = props;
  return (
    <ul className={classNames('menu menu-horizontal p-0', className)}>
      {options.map((option) => {
        return (
          <li
            key={option.value}
            className={classNames(
              { 'text-primary': value === option.value },
              'font-medium'
            )}
            onClick={() => onClick(option.value)}
          >
            <a>{option.label}</a>
          </li>
        );
      })}
    </ul>
  );
}

export default Component;
