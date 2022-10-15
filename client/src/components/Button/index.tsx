import { PropsWithChildren } from 'react';

interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'lg' | 'sm' | 'xs';
  loading?: boolean;
}

const Component: React.FC<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>
) => {
  const { type, size, children, loading, ...restProps } = props;

  let className = 'btn ';

  if (type) {
    className += `btn-${type} `;
  }

  if (size) {
    className += `btn-${size} `;
  }

  if (loading) {
    className += `loading `;
  }

  return (
    <button className={className} {...restProps}>
      {children}
    </button>
  );
};

export default Component;
