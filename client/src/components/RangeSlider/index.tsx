import classNames from 'classnames';
import { useMemo } from 'react';
import { Itype } from '../type';

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  min?: number;
  max?: number;
  type?: Itype;
}

function Component(props: Props) {
  const { max = 100, min = 0, type = 'primary', ..._props } = props;

  const typeCls = useMemo(() => {
    switch (type) {
      case 'primary':
        return 'range-primary';
      case 'secondary':
        return 'range-secondary';
      case 'accent':
        return 'range-accent';
    }
  }, [type]);

  return (
    <input
      type="range"
      min={min}
      max={max}
      className={classNames('range max-w-xs', typeCls)}
      {..._props}
    />
  );
}

export default Component;
