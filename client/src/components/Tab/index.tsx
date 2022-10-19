import { ISize } from '~components/type';

interface Tab<T> {
  label: string;
  value: T;
}

interface Props<T> {
  active?: T;
  size?: ISize;
  tabs: Tab<T>[];
  type?: 'bordered' | 'lifted' | 'boxed';
  onChange?(args: T): void;
}

function Component<T>(props: Props<T>) {
  const {
    tabs = [],
    type = 'boxed',
    active = tabs[0],
    onChange = () => {},
  } = props;

  let cls = 'tabs ';

  if (type) {
    cls += `tabs-${type} `;
  }

  return (
    <div className={cls}>
      {tabs.map((tab) => {
        const { label, value } = tab;
        let cls = 'tab ';

        if (active === value) {
          cls += 'tab-active ';
        }

        return (
          <a key={label} onClick={() => onChange(value)} className={cls}>
            {label}
          </a>
        );
      })}
    </div>
  );
}

export default Component;
