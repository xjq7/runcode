import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import EditorConfig from '~store/config/editor';
import { Drawer, Input, Slider } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Component(props: Props) {
  const { open, onClose } = props;

  const { t } = useTranslation();

  const [editorConfig] = useState(() => EditorConfig);

  const { autoSaveDelay, setAutoSaveDelay, setFontSize, fontSize } =
    editorConfig;

  const handleDelayChange = (value: number) => {
    setAutoSaveDelay(value);
  };

  return (
    <Drawer title={t('setting.panel.title')} onClose={onClose} open={open}>
      <div className="font-semibold m-2 text-xl">{t('setting.autosave')}:</div>
      <Slider
        min={1}
        max={10}
        value={autoSaveDelay}
        onChange={handleDelayChange}
      />
      <li className="p-2">
        {t('setting.autosave.prompt', { delay: autoSaveDelay })}
      </li>
      <div className="font-semibold m-2 text-xl">{t('setting.fontsize')}:</div>
      <Input
        size="large"
        value={fontSize}
        onChange={(e) => {
          const fontSize = Number(e.target.value);
          if (!Number.isNaN(fontSize)) setFontSize(fontSize);
        }}
      />
    </Drawer>
  );
}

export default observer(Component);
