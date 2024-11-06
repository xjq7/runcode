import classNames from 'classnames';
import useLocation from 'react-use/lib/useLocation';
import EditorConfig, { Lang } from '~store/config/editor';
import { observer } from 'mobx-react-lite';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import Iconfont from '../Iconfont';
import Menu from '../Menu';
import router, { RouterPath } from '~pages/router';
import { Tooltip } from 'antd';
import { useState } from 'react';
import { Button } from 'antd';
import SettingSidebar from './SettingSidebar';
import styles from './header.module.less';

export const settingDrawerId = 'editor-setting';

function Component() {
  let location = useLocation();

  const { t } = useTranslation();

  const [editorConfig] = useState(() => EditorConfig);

  const { lang, setLang } = editorConfig;

  const { pathname } = location;

  const [settingDrawerOpen, setSettingDrawerOpen] = useState(false);

  const handleChangeLang = () => {
    if (lang === Lang.EN) {
      setLang(Lang.ZHCN);
      i18n.changeLanguage(Lang.ZHCN);
    } else if (lang === Lang.ZHCN) {
      setLang(Lang.EN);
      i18n.changeLanguage(Lang.EN);
    }
  };

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
      </div>
      <div className="flex-none pr-4">
        <Menu
          value={pathname}
          options={[
            // { label: '前端编程题', value: RouterPath.questions },
            { label: t('header.editor'), value: RouterPath.editor },
          ]}
          onClick={(pathname) => {
            router.navigate(pathname);
          }}
          className="mr-4"
        />

        <div>
          <Tooltip title={t('header.langch')}>
            <Iconfont
              name={
                lang === Lang.EN
                  ? 'zhongyingqiehuan-ying'
                  : 'zhongyingqiehuan-zhong'
              }
              size={26}
              className={classNames('w-7 mr-3')}
              onClick={handleChangeLang}
            />
          </Tooltip>
        </div>

        <div>
          <Tooltip title={t('header.feedback')}>
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
          <Tooltip title={t('header.github.repo')}>
            <Iconfont
              name="github"
              size={24}
              className={classNames('w-7 mr-3')}
              onClick={() => {
                window.open('https://github.com/xjq7/runcode', '_blank');
              }}
            />
          </Tooltip>

          <Tooltip title={t('setting.text')}>
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

export default observer(Component);
