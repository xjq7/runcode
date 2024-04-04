import classNames from 'classnames';
import useLocation from 'react-use/lib/useLocation';
import Iconfont from '../Iconfont';
import Menu from '../Menu';
import router, { RouterPath } from '~pages/router';
import { Tooltip } from 'antd';
import styles from './header.module.less';
import { useWindowSize } from 'react-use';
import { useMemo, useState } from 'react';
import { Button } from 'antd';
import SettingSidebar from './SettingSidebar';

export const settingDrawerId = 'editor-setting';

function Component() {
  let location = useLocation();

  const { width } = useWindowSize();
  const { pathname } = location;

  const [settingDrawerOpen, setSettingDrawerOpen] = useState(false);

  const showTips = useMemo(() => width > 860, [width]);

  return (
    <div className={classNames('navbar bg-base-100', styles.container)}>
      <div className="flex-1">
        <Button
          type="text"
          className="text-xl font-bold"
          size="large"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Runcode
        </Button>
        {showTips && (
          <Button
            type="text"
            onClick={() => {
              window.open('https://github.com/xjq7/runcode');
            }}
            className="text-xs mt-2 text-indigo-700"
          >
            觉得好用的话点击前往 Github 点亮 ⭐, 提一些产品建议
          </Button>
        )}
      </div>
      <div className="flex-none pr-4">
        <Menu
          value={pathname}
          options={[
            { label: '前端编程题', value: RouterPath.questions },
            { label: '编辑器', value: RouterPath.editor },
          ]}
          onClick={(pathname) => {
            router.navigate(pathname);
          }}
          className="mr-4"
        />

        <div>
          <Tooltip title="意见反馈">
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
          <Tooltip title="Github 开源地址">
            <Iconfont
              name="github"
              size={24}
              className={classNames('w-7 mr-3')}
              onClick={() => {
                window.open('https://github.com/xjq7/runcode', '_blank');
              }}
            />
          </Tooltip>

          <Tooltip title="设置">
            <Iconfont
              name="setting"
              size={24}
              className={classNames('w-7')}
              onClick={() => setSettingDrawerOpen(true)}
            />
          </Tooltip>
        </div>
      </div>
      <SettingSidebar
        open={settingDrawerOpen}
        onClose={() => {
          setSettingDrawerOpen(false);
        }}
      />
    </div>
  );
}

export default Component;
