import { PropsWithChildren } from 'react';
import Drawer from '../Drawer';
import Header, { settingDrawerId } from './Header';
import SettingSidebar from './SettingSidebar';

interface Props {}

function Component(props: PropsWithChildren<Props>) {
  const { children } = props;
  return (
    <Drawer id={settingDrawerId} Sidebar={SettingSidebar} className="w-80">
      <div style={{ paddingTop: 64 }}>
        <Header />
        {children}
      </div>
    </Drawer>
  );
}
export default Component;
