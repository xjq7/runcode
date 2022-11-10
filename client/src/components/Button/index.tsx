import classNames from 'classnames';
import { PropsWithChildren, useMemo } from 'react';

interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'lg' | 'sm' | 'xs' | 'md';
  loading?: boolean;
}

const Component: React.FC<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>
) => {
  const {
    type = 'primary',
    size = 'md',
    children,
    loading,
    className,
    onClick,
    ...restProps
  } = props;

  const typeCls = useMemo(() => {
    switch (type) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'ghost':
        return 'btn-ghost';
      case 'link':
        return 'btn-link';
    }
  }, [type]);

  const sizeCls = useMemo(() => {
    switch (size) {
      case 'lg':
        return 'btn-lg';
      case 'md':
        return 'btn-md';
      case 'sm':
        return 'btn-sm';
      case 'xs':
        return 'btn-xs';
    }
    return '';
  }, [size]);

  const loadingCls = useMemo(() => {
    if (loading) return 'loading btn-disabled';
    return '';
  }, [loading]);

  return (
    <button
      className={classNames('btn', typeCls, sizeCls, loadingCls, className)}
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
