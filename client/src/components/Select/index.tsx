import { ISize } from '~components/type';

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
}

function Component<T = string>(props: Props<T>) {
  const {
    options = [],
    onChange,
    value,
    defaultValue,
    type = 'primary',
    size = 'md',
  } = props;

  let selectClass = 'select w-full max-w-xs ';

  if (type) {
    selectClass += `select-${type} `;
  }

  if (size) {
    selectClass += `select-${size} `;
  }

  return (
    <select className={selectClass}>
      {options.map((o) => {
        const { label, value: _value, disabled } = o;
        const isSelected = value === _value;
        return (
          <option
            defaultValue={
              defaultValue as string | number | readonly string[] | undefined
            }
            value={value as string | number | readonly string[] | undefined}
            key={label}
            disabled={disabled}
            onClick={() => {
              if (!onChange) return;
              onChange(_value);
            }}
          >
            {label}
          </option>
        );
      })}
    </select>
  );
}

export default Component;
