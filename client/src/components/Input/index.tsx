import classNames from 'classnames';
import { PropsWithChildren } from 'react';

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  style?: React.CSSProperties;
  className?: string;
}

function Component(props: PropsWithChildren<Props>) {
  const { className, ...restProps } = props;
  return (
    <input
      type="text"
      placeholder="input text..."
      className={classNames('input w-full', className)}
      {...restProps}
    />
  );
}
export default Component;
