import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import _toast, { IToast } from '~store/ui/toast';

const Component = observer(() => {
  const [toastsStore] = useState(() => _toast);
  const toasts = toastsStore.value;

  const Item = (props: IToast) => {
    const {
      message = '',
      type = 'success',
      positions = ['top', 'center'],
      id,
    } = props;

    let alertClassName = 'alert ';
    if (type) {
      alertClassName += `alert-${type} `;
    }

    let toastClassName = 'toast ';

    if (positions?.length) {
      toastClassName = positions.reduce(
        (acc, cur) => (acc += `toast-${cur} `),
        ''
      );
    }

    return (
      <div className={alertClassName} key={id}>
        <div>
          <span>{message}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="toast toast-center toast-top"
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
