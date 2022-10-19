import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import _toast, { IToast, position } from '~store/ui/toast';

interface Props {
  positions?: position[];
}

const Component = observer((props: Props) => {
  const { positions = ['toast-top', 'toast-center'] } = props;

  const [toastsStore] = useState(() => _toast);
  const toasts = toastsStore.value;

  let positionsCls = '';

  if (positions?.length) {
    positionsCls = positions.reduce((acc, cur) => (acc += cur + ' '), '');
  }

  const Item = (props: IToast) => {
    const { message = '', type = 'info', id } = props;

    const typeCls = useMemo(() => {
      switch (type) {
        case 'error':
          return 'alert-error';
        case 'info':
          return 'alert-info';
        case 'success':
          return 'alert-success';
        case 'warning':
          return 'alert-warning';
      }
    }, [type]);

    return (
      <div className={classNames('alert', typeCls)} key={id}>
        <div>
          <span>{message}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={classNames('toast', positionsCls)}
      style={{
        width: 300,
        position: 'absolute',
        zIndex: 999999,
      }}
    >
      {toasts.map((o) => (
        <Item key={o.id} {...o} />
      ))}
    </div>
  );
});

export function toast(params: IToast) {
  _toast.add(params);
}

export default Component;
