import classNames from 'classnames';
import React from 'react';
import { PropsWithChildren } from 'react';

interface Props {
  Sidebar: React.FC<any>;
  id: string;
  className?: string;
}

function Component(props: PropsWithChildren<Props>) {
  const { id, Sidebar, children, className } = props;

  return (
    <div className="drawer drawer-end">
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label htmlFor={id} className="drawer-overlay"></label>
        <ul
          className={classNames(
            'menu p-4 overflow-y-auto w-96 bg-base-100 text-base-content',
            className
          )}
        >
          <Sidebar />
        </ul>
      </div>
    </div>
  );
}
export default Component;
