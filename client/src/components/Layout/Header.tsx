import classNames from 'classnames';
import useLocation from 'react-use/lib/useLocation';
import Iconfont from '../Iconfont';
import Menu from '../Menu';
import router, { RouterPath } from '~pages/router';
import styles from './header.module.less';

export const settingDrawerId = 'editor-setting';

function Component() {
  let location = useLocation();
  const { pathname } = location;

  return (
    <div className={classNames('navbar bg-base-100', styles.container)}>
      <div className="flex-1">
        <a
          className="btn btn-ghost normal-case text-xl"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Runcode
        </a>
      </div>
      <div className="flex-none pr-4">
        <Menu
          value={pathname}
          options={[
            { label: '编辑器', value: RouterPath.editor },
            { label: '访问数据', value: RouterPath.stat },
          ]}
          onClick={(pathname) => {
            router.navigate(pathname);
          }}
          className="mr-4"
        />

        <div>
          <Iconfont
            name="github"
            size={24}
            className={classNames('w-7 mr-3')}
            onClick={() => {
              window.open('https://github.com/xjq7/runcode');
            }}
          />
          <label htmlFor={settingDrawerId}>
            <Iconfont name="setting" size={24} className={classNames('w-7')} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default Component;
