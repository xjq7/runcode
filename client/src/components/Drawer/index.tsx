import React from 'react';
import { PropsWithChildren } from 'react';

interface Props {
  id: string;
  className?: string;
}

function Component(props: PropsWithChildren<Props>) {
  const { id, children } = props;

  return (
    <div className="drawer drawer-end">
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label htmlFor={id} className="drawer-overlay"></label>
      </div>
    </div>
  );
}
export default Component;
