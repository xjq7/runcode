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
  const { type, size, children, loading, onClick, ...restProps } = props;

  let className = 'btn ';

  if (type) {
    className += `btn-${type} `;
  }

  if (size) {
    className += `btn-${size} `;
  }

  if (loading) {
    className += `loading btn-disabled`;
  }

  return (
    <button
      className={className}
      onClick={(args) => {
        if (loading) return;
        onClick && onClick(args);
      }}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default Component;
