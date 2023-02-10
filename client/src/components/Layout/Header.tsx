import classNames from 'classnames';
import useLocation from 'react-use/lib/useLocation';
import Iconfont from '../Iconfont';
import Menu from '../Menu';
import router, { RouterPath } from '~pages/router';
import Tooltip from '~components/Tooltip';
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
        <a
          href="https://github.com/xjq7/runcode"
          target="_blank"
          className="text-xs mt-1 text-indigo-700"
        >
          觉得好用的话点击前往 Github 点亮 ⭐, 提一些产品建议
        </a>
      </div>
      <div className="flex-none pr-4">
        <Menu
          value={pathname}
          options={[
            { label: '编程题', value: RouterPath.questions },
            { label: '编辑器', value: RouterPath.editor },
            { label: '访问数据', value: RouterPath.stat },
            { label: '友情链接', value: RouterPath.external },
          ]}
          onClick={(pathname) => {
            router.navigate(pathname);
          }}
          className="mr-4"
        />

        <div>
          <Tooltip tips="意见反馈" position="bottom">
            <Iconfont
              name="yijianfankui"
              size={26}
              className={classNames('w-7 mr-3')}
              onClick={() => {
                window.open(
                  'https://github.com/xjq7/runcode/issues/new',
                  '_blank'
                );
              }}
            />
          </Tooltip>
          <Tooltip tips="Github 开源地址" position="bottom">
            <Iconfont
              name="github"
              size={24}
              className={classNames('w-7 mr-3')}
              onClick={() => {
                window.open('https://github.com/xjq7/runcode', '_blank');
              }}
            />
          </Tooltip>

          <Tooltip tips="设置" position="bottom">
            <label htmlFor={settingDrawerId}>
              <Iconfont
                name="setting"
                size={24}
                className={classNames('w-7')}
              />
            </label>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default Component;
